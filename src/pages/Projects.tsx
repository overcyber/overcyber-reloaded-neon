
import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileCode, Github, ExternalLink, Star, GitFork } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample projects data
const projects = [
  {
    id: 1,
    title: "NeuraScan",
    description: "Advanced neural network-based vulnerability scanner with deep learning capabilities to identify zero-day exploits in web applications.",
    tags: ["Python", "Machine Learning", "Security"],
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    github: "https://github.com/overcyber/neurascan",
    live: "https://neurascan.io",
    stars: 342,
    forks: 87,
    readme: `# NeuraScan: Next-Gen Vulnerability Scanner

## Introduction
NeuraScan is a revolutionary neural network-based vulnerability scanner that uses deep learning to identify potential zero-day exploits in web applications. By analyzing patterns in code and behavior, NeuraScan can predict vulnerabilities before they're officially discovered.

## Features
* Deep learning model trained on millions of code samples
* Real-time analysis of web traffic for anomaly detection
* Integration with CI/CD pipelines
* Comprehensive reporting with remediation suggestions
* Low false-positive rate compared to traditional scanners

## Installation

\`\`\`bash
pip install neurascan
neurascan setup --api-key YOUR_API_KEY
\`\`\`

## Usage

\`\`\`python
from neurascan import Scanner

scanner = Scanner(target="https://example.com")
results = scanner.run_analysis(depth="thorough")
results.generate_report("security_report.pdf")
\`\`\`

## Contributing
We welcome contributions! Please see CONTRIBUTING.md for details.`,
  },
  {
    id: 2,
    title: "CyberShield",
    description: "Enterprise-grade intrusion prevention system with real-time threat intelligence and automated response capabilities.",
    tags: ["Rust", "Networking", "Firewall"],
    image: "https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    github: "https://github.com/overcyber/cybershield",
    live: "https://cybershield.dev",
    stars: 765,
    forks: 134,
    readme: `# CyberShield

CyberShield is a next-generation intrusion prevention system built for high-performance environments where security cannot be compromised.

## Core Features

* Real-time packet inspection with minimal latency
* Distributed architecture for enterprise deployments
* Machine learning-based anomaly detection
* Automated incident response workflows
* Integration with major SIEM platforms

## Technical Overview

CyberShield is written primarily in Rust for both performance and memory safety. The architecture consists of:

1. **Packet Analyzer**: High-speed packet capture and inspection
2. **Threat Intelligence Engine**: Real-time correlation with known threats
3. **Response Orchestrator**: Automated actions based on detected threats
4. **Management Console**: Web interface for configuration and monitoring

## Deployment

### Docker
\`\`\`bash
docker pull overcyber/cybershield:latest
docker run -p 8443:8443 -v config:/etc/cybershield overcyber/cybershield
\`\`\`

### Manual Installation
\`\`\`bash
git clone https://github.com/overcyber/cybershield.git
cd cybershield
cargo build --release
./target/release/cybershield --config ./config.toml
\`\`\``,
  },
  {
    id: 3,
    title: "QuantumCrypt",
    description: "Post-quantum cryptographic library implementing advanced algorithms resistant to quantum computing attacks.",
    tags: ["C++", "Cryptography", "Quantum"],
    image: "https://images.unsplash.com/photo-1494891848038-7bd202a2afeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    github: "https://github.com/overcyber/quantumcrypt",
    live: null,
    stars: 531,
    forks: 97,
    readme: `# QuantumCrypt

## Quantum-Resistant Cryptographic Library

QuantumCrypt is a C++ library implementing advanced cryptographic algorithms designed to resist attacks from both classical and quantum computers.

### Supported Algorithms

* **Lattice-based**
  * NewHope
  * CRYSTALS-Kyber
  * FrodoKEM
  
* **Hash-based**
  * SPHINCS+
  * XMSS
  
* **Code-based**
  * BIKE
  * Classic McEliece
  
* **Multivariate**
  * Rainbow
  * GeMSS

### Performance Benchmarks

| Algorithm | Key Generation | Encryption | Decryption |
|-----------|----------------|------------|------------|
| NewHope   | 0.13ms         | 0.18ms     | 0.16ms     |
| Kyber-768 | 0.09ms         | 0.11ms     | 0.12ms     |
| SPHINCS+  | 21.5ms         | 0.41ms     | 15.8ms     |
| BIKE-L1   | 1.25ms         | 1.83ms     | 2.14ms     |

### Integration Examples

#### OpenSSL Integration

\`\`\`cpp
#include <quantumcrypt.h>
#include <openssl/ssl.h>

// Initialize QuantumCrypt with OpenSSL
QCrypt_OpenSSL_Init();

// Register Kyber for key exchange
SSL_CTX_set_post_quantum_kex(ssl_ctx, QCrypt_KEX_KYBER768);

// Use hybrid certificates (classical + post-quantum)
SSL_CTX_use_hybrid_cert(ssl_ctx, "cert.pem", "sphincs.key");
\`\`\`

#### Direct Usage

\`\`\`cpp
#include <quantumcrypt.h>

// Generate key pair
QCrypt_KeyPair keys;
QCrypt_GenerateKeyPair(QCRYPT_ALG_KYBER, 768, &keys);

// Encrypt data
QCrypt_Ciphertext ct;
QCrypt_Encrypt(plaintext, plaintext_len, keys.public_key, &ct);

// Decrypt data
unsigned char decrypted[MAX_PLAINTEXT_SIZE];
size_t decrypted_len;
QCrypt_Decrypt(ct, keys.private_key, decrypted, &decrypted_len);
\`\`\``,
  },
];

const Projects = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  
  const filteredProjects = activeTab === "all" 
    ? projects 
    : projects.filter(project => project.tags.some(tag => 
        tag.toLowerCase() === activeTab.toLowerCase()));

  return (
    <Layout title="PROJECTS DATABASE">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="bg-cyber-black border border-cyber-neon/30 p-1">
          <TabsTrigger 
            value="all"
            className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon data-[state=active]:shadow-none"
          >
            ALL
          </TabsTrigger>
          <TabsTrigger 
            value="python"
            className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon data-[state=active]:shadow-none"
          >
            PYTHON
          </TabsTrigger>
          <TabsTrigger 
            value="rust"
            className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon data-[state=active]:shadow-none"
          >
            RUST
          </TabsTrigger>
          <TabsTrigger 
            value="c++"
            className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon data-[state=active]:shadow-none"
          >
            C++
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <Card 
            key={project.id} 
            className="neo-blur border border-cyber-neon/30 overflow-hidden transition-all duration-300 hover:border-cyber-neon/70"
          >
            <AspectRatio ratio={16/9}>
              <img 
                src={project.image} 
                alt={project.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-cyber-black/70 to-transparent"></div>
            </AspectRatio>
            
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl text-white font-mono tracking-tight flex items-center">
                  <FileCode size={18} className="text-cyber-neon mr-2" />
                  {project.title}
                </CardTitle>
                
                <div className="flex items-center space-x-2 text-sm">
                  <span className="flex items-center text-cyber-orange">
                    <Star size={14} className="mr-1" />
                    {project.stars}
                  </span>
                  <span className="flex items-center text-cyber-blue">
                    <GitFork size={14} className="mr-1" />
                    {project.forks}
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pb-2">
              <p className="text-cyber-blue/80 mb-4">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="border-cyber-neon/50 text-cyber-neon">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              {expandedProject === project.id && (
                <div className="mt-4 border border-cyber-neon/30 rounded-md p-4 bg-cyber-black/60">
                  <h3 className="text-cyber-neon font-mono mb-2 text-lg">README.md</h3>
                  <div className="prose prose-invert max-w-none prose-headings:text-cyber-blue prose-headings:font-mono prose-a:text-cyber-neon">
                    <pre className="whitespace-pre-wrap font-mono text-sm text-cyber-blue/80 overflow-auto max-h-96 scrollbar-none">{project.readme}</pre>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex gap-2 pt-2 border-t border-cyber-neon/20">
              <Button 
                variant="outline" 
                size="sm"
                className="border-cyber-neon/50 text-cyber-neon hover:bg-cyber-neon/20"
                onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
              >
                {expandedProject === project.id ? "Hide README" : "Show README"}
              </Button>
              <a 
                href={project.github} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-cyber-neon/50 text-cyber-neon hover:bg-cyber-neon/20"
                >
                  <Github size={16} className="mr-2" />
                  GitHub
                </Button>
              </a>
              {project.live && (
                <a 
                  href={project.live} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border-cyber-orange/50 text-cyber-orange hover:bg-cyber-orange/20"
                  >
                    <ExternalLink size={16} className="mr-2" />
                    Live Demo
                  </Button>
                </a>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </Layout>
  );
};

export default Projects;
