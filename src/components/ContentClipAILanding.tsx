"use client";

import {
  BlueskyIcon,
  GoogleBusinessIcon,
  PinterestIcon,
  RedditIcon,
  SnapchatIcon,
  TelegramIcon,
  ThreadsIcon,
} from "@/components/icons/SocialIcons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShaderAnimation } from "@/components/ui/shader-animation";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Check,
  Clock,
  Facebook,
  Headphones,
  Image,
  Instagram,
  Linkedin,
  Play,
  Scissors,
  Share2,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Twitter,
  Users,
  Video,
  Youtube,
  Zap,
} from "lucide-react";
import React from "react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
    >
      <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 group">
        <CardHeader>
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            {icon}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-muted-foreground leading-relaxed">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  delay?: number;
}

const PricingCard: React.FC<PricingCardProps> = ({
  name,
  price,
  description,
  features,
  popular = false,
  delay = 0,
}) => {
  const { isSignedIn } = useUser();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="relative"
    >
      {popular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
          Most Popular
        </Badge>
      )}
      <Card
        className={`h-full ${
          popular ? "border-primary shadow-lg scale-105" : "border-border/50"
        } bg-card/50 backdrop-blur-sm`}
      >
        <CardHeader>
          <CardTitle className="text-2xl">{name}</CardTitle>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">{price}</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
          {isSignedIn ? (
            <Button
              className="w-full"
              variant={popular ? "default" : "outline"}
            >
              Upgrade to {name}
            </Button>
          ) : (
            <SignUpButton mode="modal">
              <Button
                className="w-full"
                variant={popular ? "default" : "outline"}
              >
                Get Started
              </Button>
            </SignUpButton>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
  delay?: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  role,
  content,
  avatar,
  rating,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
    >
      <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-1 mb-4">
            {[...Array(rating)].map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            &ldquo;{content}&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback>
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{name}</p>
              <p className="text-sm text-muted-foreground">{role}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ContentClipAILanding: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const { isSignedIn, user } = useUser();

  const features = [
    {
      icon: <Scissors className="w-6 h-6 text-primary" />,
      title: "AI Video Clipping",
      description:
        "Automatically extract the best moments from your long-form content with our advanced AI algorithms.",
    },
    {
      icon: <Image className="w-6 h-6 text-primary" />,
      title: "Smart Image Generation",
      description:
        "Create stunning thumbnails and social media graphics with AI-powered image generation and analysis tools.",
    },
    {
      icon: <Zap className="w-6 h-6 text-primary" />,
      title: "Lightning Fast Processing",
      description:
        "Process hours of content in minutes with our optimized cloud infrastructure.",
    },
    {
      icon: <Share2 className="w-6 h-6 text-primary" />,
      title: "Multi-Platform Export",
      description:
        "Export content optimized for all major social platforms with perfect sizing and formatting.",
    },
    {
      icon: <Clock className="w-6 h-6 text-primary" />,
      title: "Save 10x Time",
      description:
        "Reduce your content creation workflow from hours to minutes with intelligent automation.",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-primary" />,
      title: "Viral Content Insights",
      description:
        "Get AI-powered suggestions on what clips are most likely to go viral on each platform.",
    },
  ];

  const platforms = [
    {
      name: "YouTube",
      icon: <Youtube className="w-8 h-8" />,
      color: "text-red-500",
    },
    {
      name: "Instagram",
      icon: <Instagram className="w-8 h-8" />,
      color: "text-pink-500",
    },
    {
      name: "TikTok",
      icon: <Video className="w-8 h-8" />,
      color: "text-black dark:text-white",
    },
    {
      name: "X (Twitter)",
      icon: <Twitter className="w-8 h-8" />,
      color: "text-blue-500",
    },
    {
      name: "Facebook",
      icon: <Facebook className="w-8 h-8" />,
      color: "text-blue-600",
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="w-8 h-8" />,
      color: "text-blue-700",
    },
    {
      name: "Threads",
      icon: <ThreadsIcon className="w-8 h-8" />,
      color: "text-black dark:text-white",
    },
    {
      name: "Snapchat",
      icon: <SnapchatIcon className="w-8 h-8" />,
      color: "text-yellow-400",
    },
    {
      name: "Pinterest",
      icon: <PinterestIcon className="w-8 h-8" />,
      color: "text-red-600",
    },
    {
      name: "Reddit",
      icon: <RedditIcon className="w-8 h-8" />,
      color: "text-orange-500",
    },
    {
      name: "Telegram",
      icon: <TelegramIcon className="w-8 h-8" />,
      color: "text-blue-400",
    },
    {
      name: "Bluesky",
      icon: <BlueskyIcon className="w-8 h-8" />,
      color: "text-sky-500",
    },
    {
      name: "Google Business",
      icon: <GoogleBusinessIcon className="w-8 h-8" />,
      color: "text-blue-500",
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$19",
      description: "Perfect for individual creators getting started",
      features: [
        "10 video clips per month",
        "5 AI-generated images",
        "Basic templates",
        "720p export quality",
        "Email support",
        "5 social platforms",
      ],
    },
    {
      name: "Creator",
      price: "$49",
      description: "Ideal for growing content creators",
      features: [
        "50 video clips per month",
        "25 AI-generated images",
        "Premium templates",
        "4K export quality",
        "Priority support",
        "Custom branding",
        "All social platforms",
        "Analytics dashboard",
      ],
      popular: true,
    },
    {
      name: "Pro",
      price: "$99",
      description: "For professional creators and teams",
      features: [
        "Unlimited video clips",
        "Unlimited AI images",
        "All premium features",
        "Team collaboration",
        "API access",
        "White-label options",
        "24/7 phone support",
        "Custom integrations",
      ],
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "YouTube Creator (2M+ subs)",
      content:
        "ContentClip AI has revolutionized my workflow. What used to take me 8 hours now takes 30 minutes! The AI knows exactly which moments will perform best.",
      avatar: "/api/placeholder/40/40",
      rating: 5,
    },
    {
      name: "Mike Chen",
      role: "TikTok Influencer",
      content:
        "The multi-platform optimization is incredible. I can create content for TikTok, Instagram, and YouTube simultaneously. My engagement has increased by 300%!",
      avatar: "/api/placeholder/40/40",
      rating: 5,
    },
    {
      name: "Emma Davis",
      role: "Content Manager",
      content:
        "Managing content for 12 different platforms used to be a nightmare. Now it's seamless. The AI image generation saves us thousands on graphic design.",
      avatar: "/api/placeholder/40/40",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">ContentClip AI</span>
          </div>
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Welcome back, {user?.firstName}!
                </span>
                <Button variant="outline" size="sm" asChild>
                  <a href="/dashboard">Dashboard</a>
                </Button>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                      userButtonPopoverCard:
                        "bg-background border border-border",
                      userButtonPopoverActionButton:
                        "text-foreground hover:bg-accent",
                    },
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm">Get Started</Button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20 overflow-hidden">
        {/* Shader Animation Background */}
        <div className="absolute inset-0 opacity-20">
          <ShaderAnimation />
        </div>

        {/* Gradient Overlay */}
        <motion.div
          style={{ y, opacity }}
          className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background/80 to-secondary/10"
        />

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Content Creation
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              ContentClip AI
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your long-form content into viral clips and stunning
              visuals with AI. Create, analyze, and post across 12+ platforms
              effortlessly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {isSignedIn ? (
                <Button size="lg" className="px-8 py-6 text-lg" asChild>
                  <a href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>
              ) : (
                <SignUpButton mode="modal">
                  <Button size="lg" className="px-8 py-6 text-lg">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </SignUpButton>
              )}
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Setup in 2 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>10,000+ creators</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Powerful AI Tools for Modern Creators
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to create engaging content that drives results
              across all platforms
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Platform Integrations */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Post to Every Major Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Create content optimized for Bluesky, Facebook, Google Business,
              Instagram, LinkedIn, Pinterest, Reddit, Snapchat, Telegram,
              Threads, TikTok, X (Twitter), and YouTube
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {platforms.map((platform, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center gap-4 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300"
              >
                <div className={platform.color}>{platform.icon}</div>
                <span className="font-semibold text-sm text-center">
                  {platform.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Loved by Creators Worldwide
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join thousands of creators who have transformed their content
              workflow with AI
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                name={testimonial.name}
                role={testimonial.role}
                content={testimonial.content}
                avatar={testimonial.avatar}
                rating={testimonial.rating}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the perfect plan for your content creation needs. Start
              free, upgrade anytime.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <PricingCard
                key={index}
                name={plan.name}
                price={plan.price}
                description={plan.description}
                features={plan.features}
                popular={plan.popular}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Content?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of creators who are already saving time and
              creating better content with ContentClip AI
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              {isSignedIn ? (
                <Button size="lg" className="px-8 py-6 text-lg" asChild>
                  <a href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>
              ) : (
                <SignUpButton mode="modal">
                  <Button size="lg" className="px-8 py-6 text-lg">
                    Start Your Free Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </SignUpButton>
              )}
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                <Headphones className="w-5 h-5 mr-2" />
                Talk to Sales
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              14-day free trial • No credit card required • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-muted/50 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold">ContentClip AI</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Support
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Documentation
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>
              &copy; 2024 ContentClip AI. All rights reserved. Empowering
              creators with AI-powered content tools.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContentClipAILanding;
