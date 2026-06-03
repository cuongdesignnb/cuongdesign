"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ExternalLink, Info, Search, Filter } from "lucide-react";
import { projects as staticProjects } from "@/data/projects";
import { techStack } from "@/data/techStack";
import GlassCard from "../ui/GlassCard";
import SectionHeading from "../ui/SectionHeading";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

export default function FeaturedProjectsSection({ initialProjects }: { initialProjects?: any[] }) {
  const projects = initialProjects || staticProjects;
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTech, setSelectedTech] = useState<string>("All");

  // Get unique categories for filters
  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(projects.map((p) => p.category)))];
  }, []);

  // Filter projects based on category, technology, and search query
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesCategory =
        activeCategory === "All" || project.category === activeCategory;
      const matchesTech =
        selectedTech === "All" || project.techStack.includes(selectedTech);
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.descriptionVi || project.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.techStack.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesTech && matchesSearch;
    });
  }, [activeCategory, selectedTech, searchQuery]);

  return (
    <section id="projects" className="py-24 relative overflow-hidden bg-[#030014]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          title="Dự án nổi bật / Featured Projects"
          subtitle="Danh sách các dự án thực tế tôi đã thiết kế và lập trình hoàn thiện."
        />

        {/* Filter Controls Panel */}
        <GlassCard className="p-6 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-white/5 bg-[#0b0921]/30">
          {/* Categories Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                    : "bg-white/5 text-gray-400 hover:text-white border border-white/5 hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search and Technology Filters */}
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative grow md:grow-0">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm dự án..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input pl-9 pr-4 py-2 text-xs w-full md:w-56 focus:outline-none"
              />
            </div>

            {/* Quick Tech Dropdown */}
            <div className="relative">
              <select
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
                className="glass-input px-3 py-2 text-xs pr-8 bg-transparent border border-white/10 rounded-xl text-gray-300 focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-[#0b0921] text-white">Mọi công nghệ</option>
                <option value="Next.js" className="bg-[#0b0921] text-white">Next.js</option>
                <option value="React" className="bg-[#0b0921] text-white">React</option>
                <option value="Laravel" className="bg-[#0b0921] text-white">Laravel</option>
                <option value="Tailwind CSS" className="bg-[#0b0921] text-white">Tailwind CSS</option>
                <option value="TypeScript" className="bg-[#0b0921] text-white">TypeScript</option>
              </select>
            </div>
          </div>
        </GlassCard>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <GlassCard
                key={project.id}
                className="group flex flex-col h-full overflow-hidden p-0 border border-white/5 bg-[#0d0b21]/45 hover:border-pink-500/25"
              >
                {/* Showcase Mockup Header representation using visual panel */}
                <div className="relative w-full aspect-video bg-gradient-to-br from-purple-950/40 to-pink-950/20 border-b border-white/5 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
                  
                  {/* Floating Tech Badges */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 z-10">
                    <Badge variant="primary">{project.category}</Badge>
                  </div>

                  {/* Project Representation Panel Layout */}
                  <div className="w-[80%] h-[75%] bg-[#080718]/90 border border-white/10 rounded-lg shadow-2xl p-4 flex flex-col space-y-2 group-hover:scale-[1.03] transition-transform duration-300">
                    <div className="flex items-center space-x-1.5 pb-1.5 border-b border-white/5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500/80" />
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/80" />
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500/80" />
                    </div>
                    <div className="grow flex items-center justify-center font-mono text-[10px] text-gray-500 select-none">
                      {project.slug}.html
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col grow space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-pink-400 transition-colors duration-200">
                      {project.title}
                    </h3>
                    <p className="text-gray-400 text-xs md:text-sm mt-2 leading-relaxed line-clamp-3">
                      {project.descriptionVi || project.description}
                    </p>
                  </div>

                  {/* Tech stack tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {project.techStack.map((tech: string) => (
                      <span key={tech} className="text-[10px] bg-white/5 border border-white/5 rounded-md px-2 py-0.5 text-gray-300 font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2 mt-auto">
                    <Link 
                      href={`/du-an/${project.slug}`} 
                      className="grow inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 px-4 py-2 text-sm border border-white/15 text-white hover:bg-white/5 hover:border-pink-500/50 hover:shadow-[0_0_15px_rgba(236,72,153,0.15)] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Chi tiết / Info</span>
                    </Link>
                    {project.demoUrl && (
                      <a 
                        href={project.demoUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="grow inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 px-4 py-2 text-sm bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white shadow-[0_4px_20px_rgba(236,72,153,0.2)] hover:shadow-[0_4px_25px_rgba(236,72,153,0.45)] hover:scale-[1.02] flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Demo / Preview</span>
                      </a>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">Không tìm thấy dự án nào phù hợp với bộ lọc.</p>
          </div>
        )}
      </div>
    </section>
  );
}
