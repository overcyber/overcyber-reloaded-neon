
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image?: string;
  createdAt: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from an API
    const loadPosts = () => {
      try {
        const storedPosts = localStorage.getItem("blog-posts");
        if (storedPosts) {
          setPosts(JSON.parse(storedPosts));
        }
      } catch (error) {
        console.error("Failed to load blog posts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Layout>
      <div className="container py-10 mx-auto">
        <h1 className="text-4xl font-bold mb-8 cyber-glow">Blog</h1>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-pulse text-primary">Loading posts...</div>
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="neo-blur hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                {post.image && (
                  <div 
                    className="h-48 w-full bg-cover bg-center rounded-t-lg border-b border-primary/20"
                    style={{ backgroundImage: `url(${post.image})` }}
                  />
                )}
                <CardHeader>
                  <h2 className="text-2xl font-bold font-cyber tracking-wide">
                    <Link 
                      to={`/blog/${post.slug}`}
                      className="text-primary hover:text-accent transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-muted-foreground font-mono">
                    {formatDate(post.createdAt)}
                  </p>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-foreground/80">
                    {post.excerpt || post.content.substring(0, 100) + '...'}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline">
                    <Link to={`/blog/${post.slug}`}>
                      <FileText className="mr-2 h-4 w-4" />
                      Read more
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-10 border border-dashed border-primary/30 rounded-lg">
            <h3 className="text-xl font-bold mb-2">No Posts Yet</h3>
            <p className="text-muted-foreground mb-4">
              There are no blog posts to display yet. Check back later or create one in the admin panel.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
