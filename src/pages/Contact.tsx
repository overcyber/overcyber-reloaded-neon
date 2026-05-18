
import { useState } from 'react';
import Layout from '@/components/Layout';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AtSign, MessageCircle, User, Send, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card } from '@/components/ui/card';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const { api } = await import("@/lib/api");
      const { requestAndSolvePow } = await import("@/lib/pow");
      const pow = await requestAndSolvePow();
      await api("/contact", {
        method: "POST",
        json: {
          name: values.name,
          email: values.email,
          subject: values.subject,
          body: values.message,
          website: "",
          pow,
        },
      });
      form.reset();
      toast.success("Message sent successfully! I'll respond as soon as possible.");
    } catch (err: any) {
      // Fallback silencioso quando o backend ainda não estiver de pé
      console.warn("contact send failed:", err);
      toast.error(err?.message || "Could not send message.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Layout title="SECURE TRANSMISSION">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card className="neo-blur border border-cyber-neon/30 p-6 h-full">
            <div className="flex flex-col h-full justify-between">
              <div>
                <h2 className="text-2xl font-bold text-cyber-neon mb-4 font-mono">DIRECT COMMUNICATION</h2>
                <p className="text-cyber-blue mb-6">Have a project in mind or just want to chat about security? Send me a message through this secure channel.</p>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="mr-4 mt-1 bg-cyber-neon/20 p-2 rounded-full border border-cyber-neon/50">
                      <AtSign className="h-5 w-5 text-cyber-neon" />
                    </div>
                    <div>
                      <h3 className="text-cyber-orange font-mono">EMAIL</h3>
                      <p className="text-cyber-blue">contact@overcyber.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mr-4 mt-1 bg-cyber-neon/20 p-2 rounded-full border border-cyber-neon/50">
                      <MessageCircle className="h-5 w-5 text-cyber-neon" />
                    </div>
                    <div>
                      <h3 className="text-cyber-orange font-mono">SOCIAL</h3>
                      <p className="text-cyber-blue">@overcyber on Twitter</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mr-4 mt-1 bg-cyber-neon/20 p-2 rounded-full border border-cyber-neon/50">
                      <Shield className="h-5 w-5 text-cyber-neon" />
                    </div>
                    <div>
                      <h3 className="text-cyber-orange font-mono">SECURITY</h3>
                      <p className="text-cyber-blue">PGP Key: <a href="/pgp-key.asc" className="text-cyber-neon hover:underline">Download</a></p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-cyber-neon/30">
                <p className="text-cyber-blue/70 italic">All messages are end-to-end encrypted and processed through secure channels.</p>
              </div>
            </div>
          </Card>
        </div>
        
        <div>
          <Card className="neo-blur border border-cyber-neon/30 p-6">
            <h2 className="text-xl font-bold text-cyber-neon mb-4 font-mono">SEND MESSAGE</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-cyber-blue flex items-center gap-2">
                        <User size={14} />
                        NAME
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your name" 
                          {...field} 
                          className="bg-cyber-black/60 border-cyber-neon/50 focus:border-cyber-orange"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-cyber-blue flex items-center gap-2">
                        <AtSign size={14} />
                        EMAIL
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your.email@example.com" 
                          {...field} 
                          className="bg-cyber-black/60 border-cyber-neon/50 focus:border-cyber-orange"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-cyber-blue flex items-center gap-2">
                        <MessageCircle size={14} />
                        SUBJECT
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Message subject" 
                          {...field} 
                          className="bg-cyber-black/60 border-cyber-neon/50 focus:border-cyber-orange"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-cyber-blue flex items-center gap-2">
                        <MessageCircle size={14} />
                        MESSAGE
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Your message..." 
                          {...field} 
                          rows={5}
                          className="bg-cyber-black/60 border-cyber-neon/50 focus:border-cyber-orange resize-none"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-cyber-neon hover:bg-cyber-neon/80 text-black font-mono"
                >
                  {isSubmitting ? (
                    <>Processing Transmission...</>
                  ) : (
                    <>
                      <Send size={16} className="mr-2" />
                      SEND MESSAGE
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
