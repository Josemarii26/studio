'use client';
import { useState, useRef, useEffect } from 'react';
import type { ChatMessage, DayData } from '@/lib/types';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Bot, User, Loader, Info, CheckCircle2, XCircle, Copy, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { nutritionalChatAnalysis, type NutritionalChatAnalysisOutput } from '@/ai/flows/nutritional-chat-analysis';
import { DietLogAILogo } from './diet-log-ai-logo';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { isSameDay, startOfToday } from 'date-fns';
import { loadChatHistory, saveChatHistory } from '@/firebase/firestore';
import { useI18n } from '@/locales/client';

const formSchema = z.object({
  message: z.string().min(10, { message: 'Please describe your meals in more detail.' }),
});

interface NutritionalChatProps {
  onAnalysisUpdate: (data: NutritionalChatAnalysisOutput) => void;
  dailyData: DayData[];
  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
}

const SimpleMarkdown = ({ text }: { text: string }) => {
    const lines = text.split('\n');
    return (
      <>
        {lines.map((line, lineIndex) => {
          // Process bold and italics within each line
          const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g).filter(Boolean);
          return (
            <div key={lineIndex}>
              {parts.map((part, partIndex) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith('*') && part.endsWith('*')) {
                    return <em key={partIndex}>{part.slice(1,-1)}</em>
                }
                return part;
              })}
            </div>
          );
        })}
      </>
    );
};

const KeywordChecker = ({ message }: { message: string }) => {
    const t = useI18n();
    const keywords = {
        'breakfast': ['breakfast', 'desayuno', 'desayunar'],
        'lunch': ['lunch', 'almuerzo', 'almorzar'],
        'dinner': ['dinner', 'cena', 'cenar'],
        'merienda': ['merienda', 'merendar']
    };
    const lowerCaseMessage = message.toLowerCase();

    return (
        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
            {Object.entries(keywords).map(([meal, terms]) => {
                const isPresent = terms.some(term => lowerCaseMessage.includes(term));
                return (
                    <div key={meal} className={cn("flex items-center gap-2", isPresent ? 'text-status-green' : 'text-status-red')}>
                        {isPresent ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        <span className="capitalize">{t(`chat.${meal}` as any)}</span>
                    </div>
                )
            })}
        </div>
    )
}

export function NutritionalChat({ onAnalysisUpdate, dailyData, messages, setMessages }: NutritionalChatProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const t = useI18n();
  
  const todaysData = dailyData.find(d => d.date && isSameDay(d.date, startOfToday()));
  const hasSuccessfulLogForToday = todaysData && Object.keys(todaysData.meals).length > 0 && todaysData.totals.calories > 0;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { message: '' },
  });

  const messageValue = form.watch('message');

  const resetToInitialMessage = () => {
    setMessages([
        { id: '1', role: 'assistant', content: t('chat.initial-message'), timestamp: new Date() }
    ]);
  }

  // Load chat history from Firestore on mount
  useEffect(() => {
    async function loadHistory() {
        if (user) {
            setIsHistoryLoading(true);
            const history = await loadChatHistory(user.uid);
            if (history.length > 0) {
                setMessages(history);
            } else {
                resetToInitialMessage();
            }
            setIsHistoryLoading(false);
        }
    }
    loadHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Save chat history to Firestore whenever it changes
  useEffect(() => {
    if (user && !isHistoryLoading && messages.length > 0) {
        saveChatHistory(user.uid, messages);
    }
  }, [messages, user, isHistoryLoading]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: t('chat.copied')});
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    }).catch(err => {
      toast({ variant: 'destructive', title: t('chat.copy-failed'), description: t('chat.copy-failed-desc') });
    });
  }

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if(hasSuccessfulLogForToday) {
        toast({
            variant: "destructive",
            title: t('chat.log-today-error'),
            description: t('chat.log-today-error-desc'),
        });
        return;
    }

    const messageContent = values.message.toLowerCase();
    const foundKeywords = new Set();

    if (['breakfast', 'desayuno', 'desayunar'].some(k => messageContent.includes(k))) foundKeywords.add('breakfast');
    if (['lunch', 'almuerzo', 'almorzar'].some(k => messageContent.includes(k))) foundKeywords.add('lunch');
    if (['dinner', 'cena', 'cenar'].some(k => messageContent.includes(k))) foundKeywords.add('dinner');
    if (['merienda', 'merendar'].some(k => messageContent.includes(k))) foundKeywords.add('merienda');

    if (foundKeywords.size < 2) {
        toast({
            variant: 'destructive',
            title: t('chat.missing-labels-error'),
            description: t('chat.missing-labels-error-desc'),
        });
        return;
    }

    const userMessage: ChatMessage = { id: String(Date.now()), role: 'user', content: values.message, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    form.reset();

    try {
      const result = await nutritionalChatAnalysis({ mealDescription: values.message });
      onAnalysisUpdate(result); // The parent now handles adding assistant/system messages
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = { id: String(Date.now() + 1), role: 'system', content: t('chat.server-error'), timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
      toast({
        variant: "destructive",
        title: t('chat.server-error-toast'),
        description: t('chat.server-error-toast-desc'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-card">
      <CardHeader className="flex flex-row items-center gap-3 border-b">
        <DietLogAILogo className="h-8 w-8 text-primary" />
        <div>
          <CardTitle>{t('chat.title')}</CardTitle>
          <CardDescription>{t('chat.description')}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 flex flex-col min-h-0">
          <ScrollArea className="flex-1 -mr-4" ref={scrollAreaRef}>
            {isHistoryLoading ? (
                <div className="flex h-full items-center justify-center">
                    <Loader className="h-6 w-6 animate-spin text-primary" />
                </div>
            ) : (
              <div className="space-y-6 pr-4">
                {messages.map(message => (
                  <div key={message.id} className={cn('flex items-start gap-3', message.role === 'user' ? 'justify-end' : '')}>
                    {message.role !== 'user' && (
                      <Avatar className="h-8 w-8 border bg-background">
                        <AvatarFallback><Bot className="h-4 w-4 text-primary" /></AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn(
                      'relative max-w-[80%] rounded-lg p-3 text-sm whitespace-pre-wrap group',
                      message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted',
                      message.role === 'system' && 'w-full text-center bg-transparent text-destructive'
                      )}>
                      <SimpleMarkdown text={message.content} />
                       {message.role === 'assistant' && (
                         <Button
                            variant="ghost"
                            size="icon"
                            className="absolute -bottom-2 -right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-muted/80 hover:bg-muted"
                            onClick={() => handleCopy(message.content, message.id)}
                         >
                            {copiedMessageId === message.id ? <Check className="h-4 w-4 text-status-green"/> : <Copy className="h-4 w-4"/>}
                         </Button>
                       )}
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8 border bg-background">
                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 border bg-background">
                      <AvatarFallback><Bot className="h-4 w-4 text-primary" /></AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 text-sm bg-muted">
                        <Loader className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4">
        {hasSuccessfulLogForToday ? (
            <div className="w-full text-center text-sm text-muted-foreground p-4 bg-muted rounded-lg flex items-center gap-2 justify-center">
                <Info className="h-4 w-4" />
                {t('chat.already-logged')}
            </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex w-full flex-col gap-2">
               <div className="p-2 rounded-md bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-2">{t('chat.keyword-helper')}</p>
                  <KeywordChecker message={messageValue || ''} />
               </div>
              <div className="flex w-full items-start gap-2">
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={t('chat.placeholder')}
                          className="resize-none"
                          rows={4}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              form.handleSubmit(handleSubmit)();
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="icon" disabled={isLoading || isHistoryLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardFooter>
    </div>
  );
}
