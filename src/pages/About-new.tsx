     
import React from 'react';
import Layout from '@/components/Layout';
import { getAboutContent } from '@/hooks/use-managed-content';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const About = () => {
  // Get about content from the content management system
  const aboutData = getAboutContent();
  
  // Helper function to render text with line breaks
  const renderWithLineBreaks = (text: string) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <Layout title="ABOUT">
      <div className="space-y-8">
        {/* Profile Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold cyber-glow mb-2 font-cyber">
            {aboutData.name}
          </h1>
          <p className="text-cyber-blue/80 text-lg font-mono">{aboutData.title}</p>
        </div>

        {/* Biography Section */}
        <Card className="neo-blur border border-cyber-neon/30">
          <CardHeader>
            <CardTitle className="text-cyber-neon font-mono flex items-center">
              <span className="text-cyber-orange">&gt;</span>_BIOGRAFIA
            </CardTitle>
          </CardHeader>
          <CardContent className="text-cyber-blue/80">
            <p>{aboutData.bio}</p>
          </CardContent>
        </Card>

        {/* Education Section */}
        <Card className="neo-blur border border-cyber-neon/30">
          <CardHeader>
            <CardTitle className="text-cyber-neon font-mono flex items-center">
              <span className="text-cyber-orange">&gt;</span>_FORMAÇÃO
            </CardTitle>
          </CardHeader>
          <CardContent className="text-cyber-blue/80">
            <p>{renderWithLineBreaks(aboutData.education)}</p>
          </CardContent>
        </Card>

        {/* Experience Section */}
        <Card className="neo-blur border border-cyber-neon/30">
          <CardHeader>
            <CardTitle className="text-cyber-neon font-mono flex items-center">
              <span className="text-cyber-orange">&gt;</span>_EXPERIÊNCIA
            </CardTitle>
          </CardHeader>
          <CardContent className="text-cyber-blue/80">
            <p>{renderWithLineBreaks(aboutData.experience)}</p>
          </CardContent>
        </Card>

        {/* Publications Section */}
        <Card className="neo-blur border border-cyber-neon/30">
          <CardHeader>
            <CardTitle className="text-cyber-neon font-mono flex items-center">
              <span className="text-cyber-orange">&gt;</span>_PUBLICAÇÕES
            </CardTitle>
          </CardHeader>
          <CardContent className="text-cyber-blue/80">
            <p>{renderWithLineBreaks(aboutData.publications)}</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};


export default About;
