import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { FileText, Image, Plus } from "lucide-react";

export default function Admin() {
  // Content Management State
  const [aboutHeading, setAboutHeading] = useState("About Me");
  const [aboutContent, setAboutContent] = useState(
    "Hi, I'm a cyberpunk enthusiast and developer. Welcome to my digital space where I share my thoughts, projects and experiences."
  );

  // Blog Post State
  const [blogTitle, setBlogTitle] = useState("");
  const [blogSlug, setBlogSlug] = useState("");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogImage, setBlogImage] = useState("");

  const handleAboutSave = () => {
    // In a real app, this would save to a database or file
    localStorage.setItem(
      "about-content",
      JSON.stringify({ heading: aboutHeading, content: aboutContent })
    );
    toast({
      title: "Content Updated",
      description: "About page content has been saved successfully.",
    });
  };

  const handleBlogPostCreate = () => {
    // Validate inputs
    if (!blogTitle || !blogSlug || !blogContent) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would save to a database
    const blogPosts = JSON.parse(localStorage.getItem("blog-posts") || "[]");
    const newPost = {
      id: Date.now().toString(),
      title: blogTitle,
      slug: blogSlug,
      excerpt: blogExcerpt,
      content: blogContent,
      image: blogImage,
      createdAt: new Date().toISOString(),
    };
    
    blogPosts.push(newPost);
    localStorage.setItem("blog-posts", JSON.stringify(blogPosts));
    
    // Reset form
    setBlogTitle("");
    setBlogSlug("");
    setBlogExcerpt("");
    setBlogContent("");
    setBlogImage("");
    
    toast({
      title: "Blog Post Created",
      description: "Your new blog post has been created successfully.",
    });
  };

  // Helper function to convert title to slug
  const generateSlugFromTitle = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "-");
  };

  return (
    <Layout>
      <div className="container py-10 mx-auto">
        <h1 className="text-3xl font-bold mb-6 cyber-glow">Admin Dashboard</h1>
        
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="about">About Page</TabsTrigger>
            <TabsTrigger value="blog">Blog Posts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="about">
            <Card className="neo-blur">
              <CardHeader>
                <CardTitle>About Page Content</CardTitle>
                <CardDescription>
                  Edit the content that appears on your About page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="heading">Heading</Label>
                  <Input
                    id="heading"
                    value={aboutHeading}
                    onChange={(e) => setAboutHeading(e.target.value)}
                    className="font-cyber"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={aboutContent}
                    onChange={(e) => setAboutContent(e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleAboutSave} className="cyber-button">
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="blog">
            <Card className="neo-blur">
              <CardHeader>
                <CardTitle>Create Blog Post</CardTitle>
                <CardDescription>
                  Add a new post to your blog.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="blog-title">Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="blog-title"
                    value={blogTitle}
                    onChange={(e) => {
                      setBlogTitle(e.target.value);
                      if (!blogSlug) {
                        setBlogSlug(generateSlugFromTitle(e.target.value));
                      }
                    }}
                    className="font-cyber"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="blog-slug">Slug <span className="text-red-500">*</span></Label>
                  <Input
                    id="blog-slug"
                    value={blogSlug}
                    onChange={(e) => setBlogSlug(e.target.value)}
                    className="font-mono text-sm"
                    required
                    placeholder="my-blog-post"
                  />
                  <p className="text-xs text-muted-foreground">
                    The URL-friendly version of the title. 
                    Automatically generated, but can be edited.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="blog-excerpt">Excerpt</Label>
                  <Textarea
                    id="blog-excerpt"
                    value={blogExcerpt}
                    onChange={(e) => setBlogExcerpt(e.target.value)}
                    placeholder="A brief summary of your post (appears in blog listing)"
                    className="h-20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="blog-image">Featured Image URL</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="blog-image"
                      value={blogImage}
                      onChange={(e) => setBlogImage(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" size="icon" disabled>
                      <Image className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter a URL for the featured image of your post.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="blog-content">Content <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="blog-content"
                    value={blogContent}
                    onChange={(e) => setBlogContent(e.target.value)}
                    placeholder="Write your blog post content here..."
                    className="min-h-[300px] font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Supports markdown formatting.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => {
                  setBlogTitle("");
                  setBlogSlug("");
                  setBlogExcerpt("");
                  setBlogContent("");
                  setBlogImage("");
                }}>
                  Reset
                </Button>
                <Button onClick={handleBlogPostCreate} className="cyber-button">
                  <Plus className="mr-2 h-4 w-4" /> Create Post
                </Button>
              </CardFooter>
            </Card>
            
            {/* Blog Post List Management would go here in a more complete implementation */}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
