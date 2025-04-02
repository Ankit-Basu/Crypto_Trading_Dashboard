"use client";

import { useState, useRef, useEffect } from "react";
import MarketOverview from './MarketOverview';
import TechnicalAnalysis from './TechnicalAnalysis';
import PricePrediction from './PricePrediction';
import NewsAnalysis from './NewsAnalysis';
import RiskAnalysis from './RiskAnalysis';
import AITradingAssistant from './AITradingAssistant';
import TradingSimulator from './TradingSimulator';
import ChatbotAssistant from './ChatbotAssistant';
import SentimentAnalysis from './SentimentAnalysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CryptoAsset } from '../types/market';
import { ChevronDownIcon, ChevronUpIcon, TrendingUpIcon, BarChart3Icon, NewspaperIcon, MessagesSquareIcon, HomeIcon } from 'lucide-react';

export default function Dashboard() {
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);
  const [isSignalsOpen, setIsSignalsOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  
  // Refs for scrolling
  const homeRef = useRef<HTMLDivElement>(null);
  const marketRef = useRef<HTMLDivElement>(null);
  const newsRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  
  // Scroll to section when navbar item is clicked
  const scrollToSection = (section: string) => {
    setActiveSection(section);
    const refMap: Record<string, React.RefObject<HTMLDivElement>> = {
      'home': homeRef,
      'market': marketRef,
      'news': newsRef,
      'chat': chatRef
    };
    
    if (refMap[section]?.current) {
      refMap[section].current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      const sections = [
        { id: 'home', ref: homeRef },
        { id: 'market', ref: marketRef },
        { id: 'news', ref: newsRef },
        { id: 'chat', ref: chatRef }
      ];
      
      for (const section of sections) {
        const element = section.ref.current;
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop && 
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 border-b border-indigo-500/20">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">AI CryptoMentor</h1>
            <div className="flex space-x-1 sm:space-x-4">
              <Button 
                variant={activeSection === 'home' ? "default" : "ghost"} 
                size="sm" 
                onClick={() => scrollToSection('home')}
                className={`flex flex-col sm:flex-row items-center gap-1 h-10 ${activeSection === 'home' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md shadow-indigo-500/30' : ''}`}
              >
                <HomeIcon className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Home</span>
              </Button>
              <Button 
                variant={activeSection === 'market' ? "default" : "ghost"} 
                size="sm" 
                onClick={() => scrollToSection('market')}
                className={`flex flex-col sm:flex-row items-center gap-1 h-10 ${activeSection === 'market' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md shadow-indigo-500/30' : ''}`}
              >
                <TrendingUpIcon className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Market</span>
              </Button>
              <Button 
                variant={activeSection === 'news' ? "default" : "ghost"} 
                size="sm" 
                onClick={() => scrollToSection('news')}
                className={`flex flex-col sm:flex-row items-center gap-1 h-10 ${activeSection === 'news' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md shadow-indigo-500/30' : ''}`}
              >
                <NewspaperIcon className="h-4 w-4" />
                <span className="text-xs sm:text-sm">News</span>
              </Button>
              <Button 
                variant={activeSection === 'chat' ? "default" : "ghost"} 
                size="sm" 
                onClick={() => scrollToSection('chat')}
                className={`flex flex-col sm:flex-row items-center gap-1 h-10 ${activeSection === 'chat' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md shadow-indigo-500/30' : ''}`}
              >
                <MessagesSquareIcon className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Chat</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Home Section */}
        <section ref={homeRef} className="py-8">
          <div className="container mx-auto px-4">
            <header className="mb-6 text-center">
              <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">AI CryptoMentor</h1>
              <p className="text-muted-foreground mt-1">AI-powered insights and analysis</p>
            </header>
          </div>
        </section>

        {/* Market & Analysis Section */}
        <section ref={marketRef} className="py-6">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Market Overview - Bigger Tiles */}
              <div className="lg:col-span-5">
                <MarketOverview onAssetSelect={setSelectedAsset} />
              </div>

              {/* Analysis Section */}
              <div className="lg:col-span-7">
                <div className="h-[620px]">
                  {selectedAsset ? (
                    <div className="h-full">
                      <Collapsible 
                        open={isSignalsOpen} 
                        onOpenChange={setIsSignalsOpen}
                        className="glassmorphic rounded-xl overflow-hidden h-full"
                      >
                        <CollapsibleTrigger className="flex w-full items-center justify-between p-4">
                          <div className="flex items-center gap-2 font-medium">
                            <BarChart3Icon className="h-5 w-5 text-indigo-400" />
                            Trading Signals & Analysis for {selectedAsset.name}
                          </div>
                          {isSignalsOpen ? (
                            <ChevronUpIcon className="h-5 w-5" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5" />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="h-[calc(100%-60px)] overflow-auto">
                          <div className="p-4 pt-0">
                            <Tabs defaultValue="technical" className="w-full h-full">
                              <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="technical">Technical</TabsTrigger>
                                <TabsTrigger value="prediction">Prediction</TabsTrigger>
                                <TabsTrigger value="risk">Risk</TabsTrigger>
                                <TabsTrigger value="trading">Trading</TabsTrigger>
                                <TabsTrigger value="simulator">Simulator</TabsTrigger>
                              </TabsList>
                              <TabsContent value="technical" className="h-full overflow-auto">
                                <Card className="glassmorphic mt-6 h-full">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <BarChart3Icon className="h-5 w-5 text-indigo-400" />
                                      Technical Analysis
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="h-[calc(100%-60px)] overflow-auto">
                                    <TechnicalAnalysis asset={selectedAsset} />
                                  </CardContent>
                                </Card>
                              </TabsContent>
                              <TabsContent value="prediction" className="h-full overflow-auto">
                                <Card className="glassmorphic mt-6 h-full">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <BarChart3Icon className="h-5 w-5 text-indigo-400" />
                                      Price Prediction
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="h-[calc(100%-60px)] overflow-auto">
                                    <PricePrediction asset={selectedAsset} />
                                  </CardContent>
                                </Card>
                              </TabsContent>
                              <TabsContent value="risk" className="h-full overflow-auto">
                                <Card className="glassmorphic mt-6 h-full">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <BarChart3Icon className="h-5 w-5 text-indigo-400" />
                                      Risk Analysis
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="h-[calc(100%-60px)] overflow-auto">
                                    <RiskAnalysis asset={selectedAsset} />
                                  </CardContent>
                                </Card>
                              </TabsContent>
                              <TabsContent value="trading" className="h-full overflow-auto">
                                <Card className="glassmorphic mt-6 h-full">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <BarChart3Icon className="h-5 w-5 text-indigo-400" />
                                      AI Trading Assistant
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="h-[calc(100%-60px)] overflow-auto">
                                    <AITradingAssistant asset={selectedAsset} />
                                  </CardContent>
                                </Card>
                              </TabsContent>
                              <TabsContent value="simulator" className="h-full overflow-auto">
                                <Card className="glassmorphic mt-6 h-full">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <BarChart3Icon className="h-5 w-5 text-indigo-400" />
                                      Trading Simulator
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="h-[calc(100%-60px)] overflow-auto">
                                    <TradingSimulator asset={selectedAsset} />
                                  </CardContent>
                                </Card>
                              </TabsContent>
                            </Tabs>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center glassmorphic rounded-xl p-8">
                      <div className="text-center">
                        <h3 className="text-xl font-medium mb-2">Select a cryptocurrency</h3>
                        <p className="text-muted-foreground">Choose an asset from the Market Overview to view detailed analysis</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* News Section */}
        <section ref={newsRef} className="py-6 bg-indigo-900/10 backdrop-blur-md">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">Market News & Sentiment</h2>
            <NewsAnalysis asset={selectedAsset} />
          </div>
        </section>

        {/* Chat Assistant Section */}
        <section ref={chatRef} className="py-6">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">AI Trading Assistant</h2>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <Card className="glassmorphic h-full">
                  <CardHeader>
                    <CardTitle>Chat with AI Assistant</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChatbotAssistant selectedAsset={selectedAsset} />
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-4">
                <Card className="glassmorphic h-full">
                  <CardHeader>
                    <CardTitle>Sentiment Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SentimentAnalysis selectedAsset={selectedAsset} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-auto py-6 border-t border-indigo-500/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground"> 2025 AI CryptoMentor. All rights reserved.</p>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-300">AI Powered</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}