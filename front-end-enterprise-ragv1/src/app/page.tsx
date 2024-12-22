import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, FileText, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <nav className="border-b">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <div className="font-bold text-xl">
            super<span className="text-gradient">RAG</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-sm" asChild>
              <a href="/auth?tab=login">Log in</a>
            </Button>
            <Button className="text-sm" asChild>
              <a href="/auth?tab=signup">Sign up</a>
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center mx-auto">
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
              Talk to your documents with{" "}
              <span className="text-gradient">superRAG</span>
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Transform the way you interact with your documents. Upload, chat,
              and extract insights instantly with AI-powered document
              conversations.
            </p>
            <div className="space-x-4">
              <Button size="lg" className="gap-2" asChild>
                <a href="/auth?tab=signup">
                  Get Started <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </div>
          </div>
        </section>

        <section className="w-full bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24">
          <div className="container mx-auto">
            <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
              <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                  <MessageSquare className="h-12 w-12 text-primary" />
                  <div className="space-y-2">
                    <h3 className="font-bold">Natural Conversations</h3>
                    <p className="text-sm text-muted-foreground">
                      Chat naturally with your documents using advanced AI
                      technology.
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                  <FileText className="h-12 w-12 text-primary" />
                  <div className="space-y-2">
                    <h3 className="font-bold">Multiple Formats</h3>
                    <p className="text-sm text-muted-foreground">
                      Support for PDFs, Word docs, text files, and more.
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                  <Zap className="h-12 w-12 text-primary" />
                  <div className="space-y-2">
                    <h3 className="font-bold">Instant Insights</h3>
                    <p className="text-sm text-muted-foreground">
                      Get quick answers and extract key information instantly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="max-w-7xl mx-auto flex h-24 items-center justify-center px-4 md:px-8">
          <p className="text-center text-sm leading-loose text-muted-foreground">
            Built with ❤️ by superRAG team. Open source on{" "}
            <a
              href="#"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
