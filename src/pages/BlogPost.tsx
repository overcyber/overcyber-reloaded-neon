
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { ArrowLeft, CalendarDays, Clock, Tag, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Sample blog post data
const blogPosts = {
  "exploiting-zero-day-vulnerabilities": {
    title: "Exploiting Zero-Day Vulnerabilities in IoT Devices",
    date: "2025-04-15",
    readTime: "8 min read",
    tags: ["Security", "IoT", "Exploit"],
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    content: `
      <p>Zero-day vulnerabilities represent one of the most significant threats in cybersecurity today. These previously unknown flaws in software or hardware can be exploited by attackers before developers have an opportunity to create patches.</p>
      
      <h2>Understanding the IoT Security Landscape</h2>
      <p>The proliferation of Internet of Things (IoT) devices has created an expansive attack surface for malicious actors. From smart home devices to industrial sensors, these connected systems often prioritize functionality and time-to-market over security.</p>
      
      <p>Recent research has revealed several concerning patterns in consumer IoT devices:</p>
      <ul>
        <li>Weak default credentials that are rarely changed by users</li>
        <li>Unencrypted communication protocols</li>
        <li>Lack of regular security updates</li>
        <li>Excessive permissions and unnecessary network exposure</li>
      </ul>
      
      <h2>Case Study: The NETWAVE IP Camera Exploit</h2>
      <p>One particularly concerning example emerged in early 2025, affecting millions of IP cameras from manufacturer NETWAVE. The vulnerability allowed attackers to bypass authentication entirely through a buffer overflow in the web interface.</p>
      
      <pre><code>
      // Vulnerable code snippet
      void process_login(char *username, char *password) {
        char user_buf[64];
        strcpy(user_buf, username); // No bounds checking
        // Authentication logic follows...
      }
      </code></pre>
      
      <p>This simple lack of input validation created an avenue for attackers to execute arbitrary code on affected devices. Through this exploit, malicious actors could:</p>
      
      <ol>
        <li>Access live camera feeds without authentication</li>
        <li>Modify device settings</li>
        <li>Use the device as part of a botnet for DDoS attacks</li>
        <li>Pivot to other devices on the same network</li>
      </ol>
      
      <h2>Protection Strategies</h2>
      <p>While perfect security is impossible, several approaches can significantly reduce your exposure to zero-day vulnerabilities:</p>
      
      <h3>For Consumers:</h3>
      <ul>
        <li>Regularly update firmware on all connected devices</li>
        <li>Isolate IoT devices on a separate network segment</li>
        <li>Change default credentials and use strong, unique passwords</li>
        <li>Disable unnecessary features and services</li>
        <li>Consider security reputation when purchasing IoT devices</li>
      </ul>
      
      <h3>For Developers:</h3>
      <ul>
        <li>Implement secure coding practices, including input validation and output encoding</li>
        <li>Conduct regular security assessments and penetration testing</li>
        <li>Establish a vulnerability disclosure program</li>
        <li>Build update mechanisms into devices from the beginning</li>
        <li>Apply the principle of least privilege in all aspects of design</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>As IoT continues to expand into every aspect of our lives, the security implications grow increasingly significant. By understanding the nature of zero-day vulnerabilities and implementing defensive measures, both users and developers can help create a more secure connected ecosystem.</p>
      
      <p>The battle between security researchers and malicious actors continues, but awareness and proactive security measures remain our best defense against the unknown threats that zero-days represent.</p>
    `,
  },
  // Additional blog posts would be defined here
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? blogPosts[slug as keyof typeof blogPosts] : null;

  if (!post) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4 text-cyber-neon">Post not found</h2>
          <p className="mb-6 text-cyber-blue">The requested article could not be located in our archives.</p>
          <Link to="/blog" className="cyber-button">
            Return to Archive
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBackButton={false}>
      <Link to="/blog" className="cyber-button mb-6 inline-flex items-center gap-2 text-cyber-neon">
        <ArrowLeft size={16} />
        <span className="font-mono">BACK TO ARCHIVE</span>
      </Link>
      
      <div className="neo-blur border border-cyber-neon/30 rounded-lg overflow-hidden">
        <div className="relative h-64 md:h-96">
          <img 
            src={post.image} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-cyber-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{post.title}</h1>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="border-cyber-neon/50 text-cyber-neon">
                  <Tag size={14} className="mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-cyber-blue/80 font-mono">
              <span className="flex items-center gap-1">
                <CalendarDays size={14} />
                {post.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {post.readTime}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-6 md:p-8">
          <div className="cyber-border rounded p-6 bg-cyber-black/70">
            <div 
              className="prose prose-invert max-w-none prose-headings:text-cyber-neon prose-headings:font-mono prose-a:text-cyber-blue hover:prose-a:text-cyber-orange prose-pre:bg-cyber-black/80 prose-pre:border prose-pre:border-cyber-neon/30"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          <div className="mt-8 border-t border-cyber-neon/30 pt-6 flex justify-between items-center">
            <div>
              <h3 className="text-cyber-neon font-mono mb-2">SHARE THIS POST</h3>
              <div className="flex gap-3">
                <button className="p-2 border border-cyber-neon/50 rounded-full hover:bg-cyber-neon/20 transition-colors">
                  <Share2 size={18} className="text-cyber-neon" />
                </button>
                {/* Additional social sharing buttons would go here */}
              </div>
            </div>
            
            <Link to="/blog" className="cyber-button">
              <span className="font-mono">RETURN TO ARCHIVE</span>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogPost;
