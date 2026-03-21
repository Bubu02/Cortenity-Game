// =============================================
// Cortenity Gaming - Shared Components
// Include this script on every page to get
// a consistent navbar and footer.
// =============================================

// --- NAVBAR COMPONENT ---
class CortenityNavbar extends HTMLElement {
    connectedCallback() {
        const isPage = window.location.pathname.includes('/pages/');
        const r = isPage ? '../' : './';
        const p = isPage ? '' : 'pages/';

        this.innerHTML = `
        <!-- Desktop / Tablet Header -->
        <header class="fixed top-0 w-full z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/[0.06]">
            <div class="w-full px-6 h-16 grid grid-cols-3 items-center">
                <!-- LEFT: Logo -->
                <a href="${r}index.html" class="flex items-center gap-2">
                    <div class="w-7 h-7 bg-white rounded-md flex items-center justify-center flex-shrink-0">
                        <svg class="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z"/>
                        </svg>
                    </div>
                    <span class="font-black text-white text-[1.05rem] tracking-tight">CORTENITY<span class="text-white/40">GAMING</span></span>
                </a>

                <!-- CENTER: Nav Links -->
                <nav class="hidden md:flex items-center justify-center gap-8">
                    <a href="${r}index.html" class="text-sm text-[#666] hover:text-white transition-colors font-medium">Home</a>
                    <a href="${p}games.html" class="text-sm text-[#666] hover:text-white transition-colors font-medium">Games</a>
                    <a href="${p}leaderboards.html" class="text-sm text-[#666] hover:text-white transition-colors font-medium">Leaderboards</a>
                    <a href="${p}community.html" class="text-sm text-[#666] hover:text-white transition-colors font-medium">Community</a>
                </nav>

                <!-- RIGHT: Search + Sign In -->
                <div class="hidden md:flex items-center justify-end gap-3">
                    <div class="relative">
                        <svg class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <input type="text" placeholder="Search games..." class="bg-white/[0.05] border border-white/10 rounded-full py-2 pl-9 pr-4 text-sm text-white/60 focus:outline-none focus:border-white/25 transition-all w-44 placeholder:text-[#444] font-sans">
                    </div>
                    <button class="px-5 py-2 bg-white hover:bg-white/85 text-black font-semibold text-sm rounded-full transition-colors">
                        Sign In
                    </button>
                </div>
            </div>
        </header>

        <!-- MOBILE: Fixed Bottom Tab Bar -->
        <nav class="md:hidden fixed bottom-0 left-0 w-full z-50 bg-[#0a0a0a] border-t border-white/[0.06]">
            <div class="flex items-center justify-around h-[60px] px-1">

                <!-- Home -->
                <a href="${r}index.html" id="tab-home" class="flex flex-col items-center gap-0.5 group min-w-0">
                    <svg class="w-5 h-5 text-[#a855f7]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                    </svg>
                    <span class="text-[0.5rem] font-bold tracking-wider uppercase text-[#a855f7]">Home</span>
                </a>

                <!-- Games -->
                <a href="${p}games.html" class="flex flex-col items-center gap-0.5 min-w-0">
                    <svg class="w-5 h-5 text-[#555]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M15 7.5V2H9v5.5l3 3 3-3zM7.5 9H2v6h5.5l3-3-3-3zM9 16.5V22h6v-5.5l-3-3-3 3zM16.5 9l-3 3 3 3H22V9h-5.5z"/>
                    </svg>
                    <span class="text-[0.5rem] font-bold tracking-wider uppercase text-[#555]">Games</span>
                </a>

                <!-- Leaderboard -->
                <a href="${p}leaderboards.html" class="flex flex-col items-center gap-0.5 min-w-0">
                    <svg class="w-5 h-5 text-[#555]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 9h3v11H5zm6-5h3v16h-3zm6 8h3v8h-3z"/>
                    </svg>
                    <span class="text-[0.5rem] font-bold tracking-wider uppercase text-[#555]">Leaderboard</span>
                </a>

                <!-- Community -->
                <a href="${p}community.html" class="flex flex-col items-center gap-0.5 min-w-0">
                    <svg class="w-5 h-5 text-[#555]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                    </svg>
                    <span class="text-[0.5rem] font-bold tracking-wider uppercase text-[#555]">Community</span>
                </a>

                <!-- Profile -->
                <a href="${p}profile.html" class="flex flex-col items-center gap-0.5 min-w-0">
                    <div class="w-5 h-5 rounded-full bg-gradient-to-br from-[#d4956a] to-[#b5723a] border border-[#8a5a2a]/60 flex items-center justify-center overflow-hidden">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14.5 5.5 C14.5 3.5 13 2 11.5 2 C9.5 2 8 3.8 8.5 6 C8.8 7.5 9.5 8.5 10.5 9.2 C9 9.8 7.5 10.8 6.5 12.5 C5.5 14 5 16 5 18 L5 22 L18 22 L18 18 C18 15.5 17 13 15.5 11.5 C14.5 10.5 13.5 10 12.5 9.5 C13.8 8.5 14.5 7.2 14.5 5.5 Z" fill="rgba(255,220,180,0.9)"/>
                        </svg>
                    </div>
                    <span class="text-[0.5rem] font-bold tracking-wider uppercase text-[#555]">Profile</span>
                </a>

            </div>
        </nav>
        `;

        // Highlight active nav link
        this.querySelectorAll('header nav a').forEach(link => {
            // Because URLs now could be ./index.html or ../index.html, simple href vs href matching might break if browser resolves them natively, but let's do a loose matching based on pathname
            if (window.location.href.includes(link.getAttribute('href').replace('./', '').replace('../', ''))) {
                link.classList.replace('text-[#666]', 'text-white');
            }
        });
    }
}

// --- FOOTER COMPONENT ---
class CortenityFooter extends HTMLElement {
    connectedCallback() {
        const isPage = window.location.pathname.includes('/pages/');
        const r = isPage ? '../' : './';
        const p = isPage ? '' : 'pages/';

        this.innerHTML = `
        <footer class="bg-[#0a0a0a] border-t border-white/[0.06] pt-16 pb-8">
            <div class="max-w-6xl mx-auto px-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 text-center md:text-left">

                    <!-- Brand -->
                    <div class="lg:col-span-1 flex flex-col items-center md:items-start">
                        <a href="${r}index.html" class="flex items-center gap-2 mb-4">
                            <div class="w-7 h-7 bg-[#2563eb] rounded-md flex items-center justify-center flex-shrink-0">
                                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z"/>
                                </svg>
                            </div>
                            <span class="font-black text-white text-[1.05rem] tracking-tight">CORTENITY<span class="text-[#2563eb]">GAMING</span></span>
                        </a>
                        <p class="text-[#475569] text-xs leading-relaxed mb-4">
                            Architecting Digital Ecosystems
                        </p>
                        <div class="space-y-1.5 text-xs text-[#475569]">
                            <p>contact@qlexia.com</p>
                            <p>Remote, Global</p>
                        </div>
                    </div>

                    <!-- Quick Links -->
                    <div class="flex flex-col items-center md:items-start">
                        <h4 class="text-white font-semibold text-sm mb-5">Quick Links</h4>
                        <ul class="space-y-3 text-sm text-[#475569]">
                            <li><a href="${r}index.html" class="hover:text-[#2563eb] transition-colors">Home</a></li>
                            <li><a href="${p}about.html" class="hover:text-[#2563eb] transition-colors">About</a></li>
                            <li><a href="${p}contact.html" class="hover:text-[#2563eb] transition-colors">Contact Us</a></li>
                            <li><a href="${p}privacy.html" class="hover:text-[#2563eb] transition-colors">Privacy Policy</a></li>
                            <li><a href="${p}work.html" class="hover:text-[#2563eb] transition-colors">Additional Work</a></li>
                        </ul>
                    </div>

                    <!-- Live Projects -->
                    <div class="flex flex-col items-center md:items-start">
                        <h4 class="text-white font-semibold text-sm mb-5">Live Projects</h4>
                        <ul class="space-y-3 text-sm text-[#475569]">
                            <li><a href="#" class="hover:text-[#2563eb] transition-colors">AI Art Revolution</a></li>
                            <li><a href="#" class="hover:text-[#2563eb] transition-colors">Best of Trend</a></li>
                        </ul>
                    </div>

                    <!-- Try Our Tools -->
                    <div class="flex flex-col items-center md:items-start">
                        <h4 class="text-white font-semibold text-sm mb-5">Try Our Tools</h4>
                        <ul class="space-y-3 text-sm text-[#475569]">
                            <li><a href="#" class="hover:text-[#2563eb] transition-colors">Realistic AI Photography</a></li>
                            <li><a href="#" class="hover:text-[#2563eb] transition-colors">Mood to AI Prompt</a></li>
                            <li><a href="#" class="hover:text-[#2563eb] transition-colors">Caption Generator</a></li>
                            <li><a href="#" class="hover:text-[#2563eb] transition-colors font-semibold text-[#2563eb]">All Tools &rarr;</a></li>
                        </ul>
                    </div>
                </div>

                <!-- Bottom bar -->
                <div class="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-xs text-[#334155] gap-4">
                    <p>&copy; 2026 Cortenity Gaming &mdash; A Qlexia Project. All rights reserved.</p>
                    <div class="flex gap-6">
                        <a href="${p}privacy.html" class="hover:text-[#2563eb] transition-colors">Privacy</a>
                        <a href="${p}terms.html" class="hover:text-[#2563eb] transition-colors">Terms</a>
                    </div>
                </div>
            </div>
        </footer>
        `;
    }
}

customElements.define('cortenity-navbar', CortenityNavbar);
customElements.define('cortenity-footer', CortenityFooter);
