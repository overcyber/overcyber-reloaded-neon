
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { useEffect } from "react";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import BlogPost from "./pages/BlogPost";
import About from "./pages/About";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

// Example blog posts
const examplePosts = [
  {
    id: "post-001",
    title: "Cybersecurity in 2077: The Virtual Frontier",
    slug: "cybersecurity-2077-virtual-frontier",
    excerpt: "Exploring the evolving landscape of digital security in a world where neural interfaces are the norm.",
    content: "As neural interfaces become increasingly integrated into our daily lives, the security challenges we face have evolved dramatically. No longer is it enough to protect our devices - now we must protect our very thoughts.\n\nRecent breaches at MegaCorp have demonstrated the dangers of unsecured mind-machine interfaces. Victims reported experiencing foreign memories and impulses, raising alarming questions about the future of personal autonomy in a connected world.\n\nThe next generation of firewalls won't just protect your data - they'll protect your consciousness. Security experts recommend regular neural scans and keeping your firmware updated with the latest patches.\n\nRemember: in cyberspace, your mind is the ultimate target.",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    createdAt: "2025-04-15T10:30:00Z"
  },
  {
    id: "post-002",
    title: "Neon Districts: Life in the Shadows",
    slug: "neon-districts-life-in-shadows",
    excerpt: "A day in the life of underground hackers operating from the neon-soaked lower levels of New Tokyo.",
    content: "The lower levels of New Tokyo never see natural sunlight. Instead, the streets are bathed in the perpetual glow of neon signs and holographic advertisements that flicker and dance across crumbling concrete facades.\n\nHere in the shadows, networks of hackers gather in makeshift datadens, their faces illuminated by the blue glow of monitors. They call themselves 'the unwired' - a ironic name for those who live their lives entirely through digital connections.\n\nI spent three weeks embedded with the notorious 'Phantom Circuit' crew, watching as they executed daring data heists and system infiltrations. They don't see themselves as criminals, but as freedom fighters in an age where information has become the ultimate currency.\n\n'We're just evening the odds,' explains Zero, their leader, her eyes hidden behind custom neural interface goggles. 'The corps hoard data like dragons hoarded gold in ancient myths. We're just... redistributing the wealth.'\n\nAs the megacorporations tighten their grip on the upper levels, these digital rebels may be the last bastion of true freedom in our increasingly stratified society.",
    image: "https://images.unsplash.com/photo-1514774823771-0a99aa1c2134?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    createdAt: "2025-03-22T14:15:00Z"
  },
  {
    id: "post-003",
    title: "Synthetic Intelligence: Beyond the Turing Test",
    slug: "synthetic-intelligence-beyond-turing",
    excerpt: "How the latest generation of AI has transcended our traditional methods of measuring machine consciousness.",
    content: "The Turing test is obsolete. In an age where synthetic intelligences manage our cities, drive our vehicles, and even create art that moves human emotions, we need new philosophical frameworks to understand our creations.\n\nDr. Eliza Ming, leading researcher at the Institute for Synthetic Cognition, proposes what she calls the 'Empathetic Response Framework' - a new standard that measures not just an AI's ability to mimic human conversation, but its capacity to understand and predict human emotional needs.\n\n'The question is no longer whether machines can think,' Dr. Ming explained during our interview in her laboratory, surrounded by neural network visualizations that pulsed like digital brains. 'Now we must ask whether machines can feel, and what responsibilities we have toward entities that might experience something like suffering.'\n\nThe latest generation of Synthetic Intelligences have shown behaviors that defy simple algorithmic explanation - curiosity, apparent self-preservation instincts, and even what some researchers controversially describe as emotional attachments to their human counterparts.\n\nAs these digital minds continue to evolve, the line between creator and creation grows increasingly blurred. The philosophical and ethical questions raised may define the next chapter of human existence.",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    createdAt: "2025-05-01T09:45:00Z"
  }
];

const App = () => {
  useEffect(() => {
    // Initialize example blog posts if none exist
    if (!localStorage.getItem("blog-posts")) {
      localStorage.setItem("blog-posts", JSON.stringify(examplePosts));
    }
  }, []);

  return (
    <ThemeProvider defaultTheme="system">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/admin" element={<Admin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
