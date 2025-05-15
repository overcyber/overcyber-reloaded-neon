
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Immediately set the HTML class based on the saved theme to prevent flash
const setInitialTheme = () => {
  const storageTheme = localStorage.getItem('cyberpunk-ui-theme');
  const systemThemeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const root = document.documentElement;
  
  if (storageTheme === 'dark' || (storageTheme === 'system' && systemThemeDark) || (!storageTheme && systemThemeDark)) {
    root.classList.add('dark');
  } else {
    root.classList.add('light');
  }
};

// Add example blog posts if none exist
const addExampleBlogPosts = () => {
  if (!localStorage.getItem("blog-posts")) {
    const examplePosts = [
      {
        id: "1",
        title: "The Future of Cybernetic Implants",
        slug: "future-cybernetic-implants",
        excerpt: "How neural interfaces are revolutionizing human-machine interaction and what it means for our future.",
        content: "Neural interfaces represent the cutting edge of cybernetic technology, offering unprecedented integration between human cognition and digital systems. Recent breakthroughs at CyberTech Industries have demonstrated direct neural feedback mechanisms that allow users to control complex systems with thought alone.\n\nResearchers predict that within the next decade, non-invasive neural implants will become commonplace, leading to applications ranging from enhanced productivity tools to immersive entertainment experiences that blur the line between reality and digital constructs.\n\nEthical questions remain about the implications of such deep integration. Privacy advocates warn about potential data harvesting from neural patterns, while transhumanists celebrate the evolution of human capability. Whatever your stance, the cybernetic revolution is already underway.",
        image: "https://images.unsplash.com/photo-1614064642261-b94d567fd1d8?q=80&w=1470&auto=format&fit=crop",
        createdAt: "2025-05-10T14:22:00Z"
      },
      {
        id: "2",
        title: "Night City's Underground Tech Scene",
        slug: "night-city-underground-tech",
        excerpt: "Exploring the hidden innovations emerging from the shadowy corners of tech culture.",
        content: "Beyond the gleaming corporate towers and official R&D labs, Night City's most revolutionary tech often emerges from unlikely places. Underground fabrication labs, operating in forgotten industrial zones, have become incubators for next-generation hardware that skirts the edge of legality.\n\nThese 'basement innovators' create everything from custom neural interface mods to proprietary security bypass tools. Although corporations regularly raid these operations, the decentralized nature of the scene makes it impossible to suppress.\n\nParticularly noteworthy is the rise of 'mesh networks' operating outside standard NET infrastructure. These alternative communications channels use custom-modified hardware to create independent data transmission systems impervious to corporate surveillance.\n\nWhether you view these developments as dangerous lawlessness or necessary resistance against corporate control depends largely on which side of Night City's economic divide you call home.",
        image: "https://images.unsplash.com/photo-1620783770629-122b7f187703?q=80&w=1374&auto=format&fit=crop",
        createdAt: "2025-05-05T09:13:00Z"
      },
      {
        id: "3",
        title: "Quantum Computing Breakthrough",
        slug: "quantum-computing-breakthrough",
        excerpt: "Arasaka researchers achieve stable quantum entanglement across unprecedented distances.",
        content: "In a development that could reshape the foundations of computational science, Arasaka's Quantum Research Division announced yesterday that they have successfully maintained quantum entanglement across a distance of 500 kilometers. This shatters the previous record of 50 kilometers achieved at MIT last year.\n\nThe implications for quantum networking are profound. Current quantum computers require extreme isolation and cooling to maintain their quantum states. The ability to transmit quantum information across significant distances could enable distributed quantum computing networks that vastly exceed the capabilities of any single machine.\n\nArasaka's stock jumped 12% following the announcement, though competing tech giants questioned the verifiability of the claims given the secretive nature of the corporation's research facilities. Independent scientists have called for peer review and demonstration before the breakthrough can be confirmed.\n\nIf verified, this technology would have immediate applications in ultra-secure communications, complex system modeling, and potentially even in the development of more sophisticated AI architectures.",
        image: "https://images.unsplash.com/photo-1516110833967-0b5716ca1387?q=80&w=1374&auto=format&fit=crop",
        createdAt: "2025-04-28T16:45:00Z"
      }
    ];

    localStorage.setItem("blog-posts", JSON.stringify(examplePosts));
  }
};

// Apply theme immediately
setInitialTheme();

// Add example blog posts
addExampleBlogPosts();

createRoot(document.getElementById("root")!).render(<App />);
