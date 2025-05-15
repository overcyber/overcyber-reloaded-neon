
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Calendar, Info, AlertTriangle } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image?: string;
  createdAt: string;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, this would fetch from an API
    const loadPost = () => {
      try {
        const storedPosts = localStorage.getItem("blog-posts");
        if (storedPosts) {
          const posts: BlogPost[] = JSON.parse(storedPosts);
          const foundPost = posts.find(p => p.slug === slug);
          
          if (foundPost) {
            setPost(foundPost);
          } else {
            setError("DATA NOT FOUND");
            setTimeout(() => navigate("/blog"), 3000);
          }
        } else {
          setError("DATABASE EMPTY");
          setTimeout(() => navigate("/blog"), 3000);
        }
      } catch (error) {
        console.error("Failed to load blog post:", error);
        setError("DATA CORRUPTED");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug, navigate]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to add line breaks to the content
  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      <p key={index} className="mb-4 font-mono text-foreground/90">{line}</p>
    ));
  };

  if (loading) {
    return (
      <Layout title="LOADING DATA">
        <div className="flex justify-center items-center h-60">
          <div className="font-mono text-primary loading-dots">ACCESSING DATABASE</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="ERROR">
        <div className="cyber-terminal p-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h3 className="text-xl font-mono mb-2 text-destructive">{error}</h3>
          <p className="text-sm text-foreground/80 font-mono mb-4">
            REDIRECTING TO ARCHIVE...
          </p>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout title="NOT FOUND">
        <div className="cyber-terminal p-6 text-center">
          <h3 className="text-xl font-mono mb-2 text-primary">DATA CORRUPTED OR DELETED</h3>
          <p className="text-sm text-foreground/80 font-mono mb-4">
            THE ENTRY YOU'RE LOOKING FOR DOESN'T EXIST.
          </p>
          <Button asChild variant="outline" className="cyber-button">
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="font-mono text-xs">RETURN TO ARCHIVE</span>
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={post.title.toUpperCase()}>
      <div className="container mx-auto max-w-4xl">
        <Button 
          variant="outline" 
          asChild 
          className="cyber-button mb-6"
        >
          <Link to="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="font-mono text-xs">RETURN TO ARCHIVE</span>
          </Link>
        </Button>
        
        <article className="cyber-terminal p-6">
          <div className="terminal-header mb-6">
            <FileText size={18} className="text-primary mr-2" />
            <span className="text-primary font-mono">DATA ENTRY</span>
            <div className="ml-auto flex items-center gap-2 text-xs font-mono text-primary/70">
              <Calendar size={14} />
              {formatDate(post.createdAt)}
            </div>
          </div>
          
          {post.image && (
            <div className="mb-8 relative">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-auto max-h-80 object-cover border border-primary/30"
              />
              <div className="absolute bottom-0 left-0 bg-background/70 backdrop-blur-sm p-2 text-xs font-mono text-primary">
                IMAGE_REF#{post.id.substring(0, 6)}
              </div>
            </div>
          )}
          
          <div className="space-y-4 font-mono">
            {formatContent(post.content)}
          </div>
          
          <div className="mt-8 pt-4 border-t border-primary/20 flex justify-between">
            <div className="text-xs font-mono text-primary/50">
              REF_ID: {post.id}
            </div>
            <Button variant="outline" asChild className="cyber-button">
              <Link to="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="font-mono text-xs">ARCHIVE</span>
              </Link>
            </Button>
          </div>
        </article>
      </div>
    </Layout>
  );
}
