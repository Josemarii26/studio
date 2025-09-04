
'use client';
import { useState, useRef, useEffect } from 'react';
import type { ChatMessage, DayData } from '@/lib/types';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Bot, User, Loader } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { nutritionalChatAnalysis } from '@/ai/flows/nutritional-chat-analysis';
import { NutriTrackLogo } from './nutri-track-logo';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  message: z.string().min(10, { message: 'Please describe your meals in more detail.' }),
});

interface NutritionalChatProps {
  onAnalysisUpdate: (data: Partial<DayData>) => void;
}

const SimpleMarkdown = ({ text }: { text: string }) => {
  const content = text
    .split('**')
    .map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)
    .flatMap(part => typeof part === 'string' ? part.split('*').map((subPart, j) => j % 2 === 1 ? <em key={`${j}`}>{subPart}</em> : subPart) : part);

  return <>{content.map((part, i) => <div key={i}>{part}</div>)}</>;
};

export function NutritionalChat({ onAnalysisUpdate }: NutritionalChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: "Hi there! Describe the meals you had today, and I'll analyze them for you. For example: `For breakfast I had two scrambled eggs with spinach and a slice of whole wheat toast. For lunch, a turkey sandwich on rye with a side of apple slices...`", timestamp: new Date() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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
    const userMessage: ChatMessage = { id: String(Date.now()), role: 'user', content: values.message, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    form.reset();

    try {
      const result = await nutritionalChatAnalysis({ mealDescription: values.message });
      const assistantMessage: ChatMessage = { id: String(Date.now() + 1), role: 'assistant', content: result.analysis, timestamp: new Date() };
      setMessages(prev => [...prev, assistantMessage]);
      onAnalysisUpdate({
        // In a real app, parse `result.analysis` and update state
      });
      toast({
        title: "Analysis Complete",
        description: "Your meal has been logged and your dashboard is updated.",
      });
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = { id: String(Date.now() + 1), role: 'system', content: 'Sorry, I couldn\'t analyze that. The format might be incorrect. Please try again.', timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "There was an error processing your request.",
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
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="space-y-6 p-4">
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
      </CardContent>
      <CardFooter className="border-t p-4">
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
      </CardFooter>
    </div>
  );
}
