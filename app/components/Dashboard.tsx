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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CryptoAsset } from '../types/market';
import { ChevronDownIcon, ChevronUpIcon, TrendingUpIcon, BarChartIcon, NewspaperIcon, MessagesSquareIcon, HomeIcon } from 'lucide-react';

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
      <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            <h1 className="text-xl font-bold">AI CryptoMentor</h1>
            <div className="flex space-x-1 sm:space-x-4">
              <Button 
                variant={activeSection === 'home' ? "default" : "ghost"} 
                size="sm" 
                onClick={() => scrollToSection('home')}
                className="flex flex-col sm:flex-row items-center gap-1 h-10"
              >
                <HomeIcon className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Home</span>
              </Button>
              <Button 
                variant={activeSection === 'market' ? "default" : "ghost"} 
                size="sm" 
                onClick={() => scrollToSection('market')}
                className="flex flex-col sm:flex-row items-center gap-1 h-10"
              >
                <TrendingUpIcon className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Market</span>
              </Button>
              <Button 
                variant={activeSection === 'news' ? "default" : "ghost"} 
                size="sm" 
                onClick={() => scrollToSection('news')}
                className="flex flex-col sm:flex-row items-center gap-1 h-10"
              >
                <NewspaperIcon className="h-4 w-4" />
                <span className="text-xs sm:text-sm">News</span>
              </Button>
              <Button 
                variant={activeSection === 'chat' ? "default" : "ghost"} 
                size="sm" 
                onClick={() => scrollToSection('chat')}
                className="flex flex-col sm:flex-row items-center gap-1 h-10"
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
              <h1 className="text-3xl sm:text-4xl font-bold">Cryptocurrency Trading Dashboard</h1>
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
                {selectedAsset ? (
                  <div className="h-full">
                    <Collapsible 
                      open={isSignalsOpen} 
                      onOpenChange={setIsSignalsOpen}
                      className="w-full border rounded-lg bg-card shadow-sm h-full"
                    >
                      <CollapsibleTrigger className="flex w-full items-center justify-between p-4">
                        <div className="flex items-center gap-2 font-medium">
                          <BarChartIcon className="h-5 w-5 text-primary" />
                          Trading Signals & Analysis for {selectedAsset.name}
                        </div>
                        {isSignalsOpen ? (
                          <ChevronUpIcon className="h-5 w-5" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="max-h-[500px] overflow-hidden">
                        <div className="p-4 pt-0">
                          <Tabs defaultValue="technical" className="w-full">
                            <TabsList className="grid w-full grid-cols-5">
                              <TabsTrigger value="technical">Technical</TabsTrigger>
                              <TabsTrigger value="prediction">Prediction</TabsTrigger>
                              <TabsTrigger value="risk">Risk</TabsTrigger>
                              <TabsTrigger value="trading">Trading</TabsTrigger>
                              <TabsTrigger value="simulator">Simulator</TabsTrigger>
                            </TabsList>
                            <TabsContent value="technical" className="h-[400px] overflow-hidden">
                              <TechnicalAnalysis asset={selectedAsset} />
                            </TabsContent>
                            <TabsContent value="prediction" className="h-[400px] overflow-auto">
                              <PricePrediction asset={selectedAsset} />
                            </TabsContent>
                            <TabsContent value="risk" className="h-[400px] overflow-auto">
                              <RiskAnalysis asset={selectedAsset} />
                            </TabsContent>
                            <TabsContent value="trading" className="h-[400px] overflow-auto">
                              <AITradingAssistant asset={selectedAsset} />
                            </TabsContent>
                            <TabsContent value="simulator" className="h-[400px] overflow-auto">
                              <TradingSimulator asset={selectedAsset} />
                            </TabsContent>
                          </Tabs>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                ) : (
                  <Card className="h-full shadow-md flex flex-col justify-center items-center p-8 border-dashed border-2">
                    <CardContent className="text-center">
                      <BarChartIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground/60" />
                      <h3 className="text-xl font-semibold mb-2">No Cryptocurrency Selected</h3>
                      <p className="text-muted-foreground">
                        Select a cryptocurrency from the market overview to view detailed analysis and trading signals.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* News & Chat Section */}
        <div className="py-6 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* News Analysis Section */}
              <section ref={newsRef} className="lg:col-span-5">
                <Card className="shadow-md h-full">
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <NewspaperIcon className="h-4 w-4 text-primary" />
                      Crypto News & Sentiment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <NewsAnalysis />
                  </CardContent>
                </Card>
              </section>

              {/* Chatbot Section */}
              <section ref={chatRef} className="lg:col-span-7">
                <Card className="shadow-md h-full">
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessagesSquareIcon className="h-4 w-4 text-primary" />
                      AI Trading Assistant
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChatbotAssistant />
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}