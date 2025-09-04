
'use client';
import { useState, useRef, useEffect } from 'react';
import type { ChatMessage, DayData } from '@/lib/types';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Bot, User, Loader, Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { nutritionalChatAnalysis } from '@/ai/flows/nutritional-chat-analysis';
import { NutriTrackLogo } from './nutri-track-logo';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { isSameDay, startOfToday } from 'date-fns';

const formSchema = z.object({
  message: z.string().min(10, { message: 'Please describe your meals in more detail.' }),
});

interface NutritionalChatProps {
  onAnalysisUpdate: (data: { analysis: string, creatineTaken: boolean, proteinTaken: boolean }) => void;
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

export function NutritionalChat({ onAnalysisUpdate, dailyData, messages, setMessages }: NutritionalChatProps) {
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const chatHistoryKey = user ? `chatHistory-${user.uid}` : null;
  
  const todaysData = dailyData.find(d => d.date && isSameDay(d.date, startOfToday()));
  const hasSuccessfulLogForToday = todaysData && Object.keys(todaysData.meals).length > 0;


  const resetToInitialMessage = () => {
    setMessages([
        { id: '1', role: 'assistant', content: "Hi! Tell me what you ate today, including any supplements. I'll analyze it for you.", timestamp: new Date() }
    ]);
  }

  useEffect(() => {
    if (chatHistoryKey) {
        const storedHistory = localStorage.getItem(chatHistoryKey);
        if (storedHistory) {
            try {
                const parsedHistory = JSON.parse(storedHistory);
                // Make sure we have a valid array before setting state
                if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
                     setMessages(parsedHistory.map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) })));
                } else {
                    resetToInitialMessage();
                }
            } catch (error) {
                console.error("Failed to parse chat history:", error);
                resetToInitialMessage();
            }
        } else {
            resetToInitialMessage();
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatHistoryKey]);

  useEffect(() => {
    if (chatHistoryKey && messages.length > 0) {
      localStorage.setItem(chatHistoryKey, JSON.stringify(messages));
    }
  }, [messages, chatHistoryKey]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { message: '' },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if(hasSuccessfulLogForToday) {
        toast({
            variant: "destructive",
            title: "Already Logged for Today",
            description: "You can only submit one nutritional analysis per day. You can see today's entry on the calendar.",
        });
        return;
    }

    const requiredKeywords = ['breakfast', 'lunch', 'dinner', 'snack'];
    const messageContent = values.message.toLowerCase();
    const hasKeyword = requiredKeywords.some(keyword => messageContent.includes(keyword));

    if (!hasKeyword) {
        toast({
            variant: 'destructive',
            title: 'Missing Meal Labels',
            description: 'Please label your meals with "Breakfast", "Lunch", "Dinner", or "Snack" to get an accurate analysis.',
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
      const errorMessage: ChatMessage = { id: String(Date.now() + 1), role: 'system', content: 'An unexpected server error occurred. Please try again later.', timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
      toast({
        variant: "destructive",
        title: "Server Error",
        description: "There was an error processing your request on the server.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-card">
      <CardHeader className="flex flex-row items-center gap-3 border-b">
        <NutriTrackLogo className="h-8 w-8 text-primary" />
        <div>
          <CardTitle>Nutritional Chat</CardTitle>
          <CardDescription>Your AI-powered nutrition assistant.</CardDescription>
        </div>
      </CardHeader>
      <div className="flex flex-1 flex-col min-h-0">
        <ScrollArea className="flex-1 p-4">
            <div ref={scrollAreaRef} className="space-y-6 pr-4">
              {messages.map(message => (
                <div key={message.id} className={cn('flex items-start gap-3', message.role === 'user' ? 'justify-end' : '')}>
                  {message.role !== 'user' && (
                    <Avatar className="h-8 w-8 border bg-background">
                      <AvatarFallback><Bot className="h-4 w-4 text-primary" /></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn(
                    'max-w-[80%] rounded-lg p-3 text-sm whitespace-pre-wrap',
                    message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted',
                    message.role === 'system' && 'w-full text-center bg-transparent text-destructive'
                    )}>
                    <SimpleMarkdown text={message.content} />
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
        </ScrollArea>
      </div>
      <CardFooter className="border-t p-4">
        {hasSuccessfulLogForToday ? (
            <div className="w-full text-center text-sm text-muted-foreground p-4 bg-muted rounded-lg flex items-center gap-2 justify-center">
                <Info className="h-4 w-4" />
                You've already logged your meals for today.
            </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex w-full items-start gap-2">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe your meals..."
                        rows={1}
                        className="min-h-0 resize-none"
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
              <Button type="submit" size="icon" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </Form>
        )}
      </CardFooter>
    </div>
  );
}
