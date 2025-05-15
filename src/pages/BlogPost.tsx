
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
            setError("Post not found");
            setTimeout(() => navigate("/blog"), 3000);
          }
        } else {
          setError("No posts available");
          setTimeout(() => navigate("/blog"), 3000);
        }
      } catch (error) {
        console.error("Failed to load blog post:", error);
        setError("Failed to load post");
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
      <p key={index} className="mb-4">{line}</p>
    ));
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-10 mx-auto">
          <div className="flex justify-center items-center h-60">
            <div className="animate-pulse text-primary">Loading post...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container py-10 mx-auto">
          <div className="text-center p-10 border border-dashed border-destructive rounded-lg">
            <h3 className="text-xl font-bold mb-2">Error</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <p className="text-sm">Redirecting to blog page...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container py-10 mx-auto">
          <div className="text-center p-10 border border-dashed border-primary/30 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Post Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The post you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link to="/blog">Back to Blog</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-10 mx-auto max-w-4xl">
        <Button 
          variant="outline" 
          asChild 
          className="mb-6"
        >
          <Link to="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
        
        <article className="prose prose-lg max-w-none dark:prose-invert">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 cyber-glow font-cyber">{post.title}</h1>
          
          <div className="text-sm text-muted-foreground font-mono mb-6">
            {formatDate(post.createdAt)}
          </div>

          {post.image && (
            <div className="mb-6">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-auto rounded-lg object-cover mb-4 border border-primary/20"
              />
            </div>
          )}
          
          <div className="space-y-4 text-foreground/90">
            {formatContent(post.content)}
          </div>
        </article>
      </div>
    </Layout>
  );
}
