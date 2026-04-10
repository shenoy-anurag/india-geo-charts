import Link from "next/link";
import { ChevronLeft, Info, ExternalLink, Calendar, Map, MapPin } from "lucide-react";
import { IndiaGeoMap } from "./IndiaGeoMap";
import randomDataJson from './india-random-topo-data.json';

export default function GeographyPage() {
  const randomData = randomDataJson as unknown as Record<string, number>;
  const title = "";
  const subtitle = "";
  const source = "";

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-12 xl:p-16 w-full mx-auto flex flex-col gap-8 md:gap-12 transition-all">
      <div className="flex flex-col gap-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group w-fit"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground flex items-center gap-4">
            Regional Distribution & Insights
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Visualizing the geographic spread of various socio-economic indicators across the states and union territories of India.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-12 w-full">
        {/* Main Chart Area */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="bg-card/40 backdrop-blur-md rounded-none p-8 min-h-[700px] border border-border/50 relative overflow-hidden flex flex-col">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">State-level Data Visualization</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 border border-border/50">
                <MapPin className="h-4 w-4" />
                Geographic Chart
              </div>
            </div>
            <div className="w-full flex-grow relative min-h-[600px]">
              <IndiaGeoMap data={randomData} title={title} subtitle={subtitle} source={source} />
            </div>
            <div className="mt-6 pt-6 border-t border-border/20 text-sm text-muted-foreground flex flex-col gap-2 leading-relaxed">
              <p>Analyzing state-wise trends enables a deeper understanding of regional disparities and localized development patterns. This interactive map allows you to explore the data dynamically across the sub-national level.</p>
              <div className="flex flex-col italic text-xs font-serif text-muted-foreground/70 mt-2">
                <span>Source: Derived from Government of India portals and periodic census data</span>
                <span>Dataset updated as of 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="flex flex-col gap-6">
          <section className="bg-muted/30 border border-muted/80 p-8 rounded-none relative overflow-hidden group">
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <Info className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold">Geographic Context</h3>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 border-l border-primary/20 pl-4 py-1">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Total Regions</span>
                  <span className="font-medium text-foreground">36 States & UTs</span>
                </div>

                <div className="flex flex-col gap-1 border-l border-primary/20 pl-4 py-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Latest Snapshot</span>
                  </div>
                  <span className="font-medium text-foreground text-sm">March 2026</span>
                </div>

                <div className="flex flex-col gap-1 border-l border-primary/20 pl-4 py-1">
                  <div className="flex items-center gap-2">
                    <Map className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Base Geometry</span>
                  </div>
                  <span className="font-medium text-foreground text-sm tracking-tight italic">GeoJSON Specification (WGS84)</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href="https://censusindia.gov.in/"
                  target="_blank"
                  className="flex items-center justify-center gap-2 w-full bg-primary/10 hover:bg-primary/20 text-primary py-3 transition-all border border-primary/20 font-semibold text-center leading-tight text-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  Census of India Portal
                </Link>
                <Link
                  href="https://data.gov.in/"
                  target="_blank"
                  className="flex items-center justify-center gap-2 w-full bg-primary/10 hover:bg-primary/20 text-primary py-3 transition-all border border-primary/20 font-semibold text-center leading-tight text-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Data Platform (OGD)
                </Link>
              </div>
            </div>
          </section>

          <div className="bg-blue-500/5 border border-blue-500/20 p-8 rounded-none text-sm leading-relaxed text-muted-foreground italic font-serif relative overflow-hidden">
            Spatial analysis is crucial for optimizing resource allocation and tracking the progress of localized governance initiatives across the subcontinent.
          </div>
        </div>
      </div>
    </main>
  );
}
