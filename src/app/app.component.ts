import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';

type Language = 'en' | 'es';

type NavItem = {
  id: string;
  label: string;
};

type LinkItem = {
  label: string;
  value: string;
  href: string;
};

type ExperienceItem = {
  company: string;
  role: string;
  period: string;
  description: string;
};

type ServiceItem = {
  title: string;
  copy: string;
};

type EducationItem = {
  title: string;
  place: string;
  period: string;
};

type LanguageItem = {
  name: string;
  level: string;
};

type TranslationFile = {
  topbar: {
    status: string;
    downloadCv: string;
  };
  navItems: NavItem[];
  hero: {
    eyebrow: string;
    intro: string;
    focusLabel: string;
    focusTitle: string;
    focusCopy: string;
    locationLabel: string;
    locationTitle: string;
    locationCopy: string;
  };
  work: {
    kicker: string;
    title: string;
    items: ExperienceItem[];
  };
  services: {
    kicker: string;
    title: string;
    items: ServiceItem[];
  };
  education: {
    kicker: string;
    title: string;
    cardTitle: string;
    languagesTitle: string;
    items: EducationItem[];
    languages: LanguageItem[];
  };
  contact: {
    kicker: string;
    title: string;
    copy: string;
    links: LinkItem[];
  };
  footerCta: {
    title: string;
    action: string;
  };
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit {
  protected currentLanguage: Language = 'en';
  protected copy: TranslationFile | null = null;
  protected activeSection = 'work';
  protected isHeroNavSticky = false;

  protected readonly heroStackRows = [
    [
      { name: 'Angular', slug: 'angular' },
      { name: 'TypeScript', slug: 'typescript' },
      { name: 'Java', slug: 'openjdk' },
      { name: 'Spring Boot', slug: 'springboot' },
      { name: 'Node.js', slug: 'nodedotjs' }
    ],
    [
      { name: 'Docker', slug: 'docker' },
      { name: 'AWS', icon: 'cloud' },
      { name: 'SQL/NoSQL', icon: 'database' },
      { name: 'Git', slug: 'git' }
    ]
  ];

  ngOnInit(): void {
    const savedLanguage = localStorage.getItem('portfolio-language');

    if (savedLanguage === 'en' || savedLanguage === 'es') {
      this.currentLanguage = savedLanguage;
    }

    void this.loadLanguage(this.currentLanguage);
  }

  ngAfterViewInit(): void {
    this.updateHeroNavState();
    this.updateActiveSection();
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    this.updateHeroNavState();
    this.updateActiveSection();
  }

  @HostListener('window:resize')
  protected onWindowResize(): void {
    this.updateHeroNavState();
    this.updateActiveSection();
  }

  protected get navItems(): NavItem[] {
    return this.copy?.navItems ?? [];
  }

  protected get services(): ServiceItem[] {
    return this.copy?.services.items ?? [];
  }

  protected get experience(): ExperienceItem[] {
    return this.copy?.work.items ?? [];
  }

  protected get education(): EducationItem[] {
    return this.copy?.education.items ?? [];
  }

  protected get languages(): LanguageItem[] {
    return this.copy?.education.languages ?? [];
  }

  protected get contactLinks(): LinkItem[] {
    return this.copy?.contact.links ?? [];
  }

  protected setActiveSection(sectionId: string): void {
    this.activeSection = sectionId;
  }

  protected setLanguage(language: Language): void {
    if (language === this.currentLanguage) {
      return;
    }

    this.currentLanguage = language;
    localStorage.setItem('portfolio-language', language);
    void this.loadLanguage(language);
  }

  private async loadLanguage(language: Language): Promise<void> {
    const response = await fetch(`/assets/i18n/${language}.json`);

    if (!response.ok) {
      throw new Error(`Failed to load translations for ${language}`);
    }

    this.copy = (await response.json()) as TranslationFile;
    this.updateActiveSection();
  }

  private updateHeroNavState(): void {
    const heroNav = document.querySelector<HTMLElement>('.hero-nav');

    if (!heroNav || window.innerWidth <= 980) {
      this.isHeroNavSticky = false;
      return;
    }

    this.isHeroNavSticky = heroNav.getBoundingClientRect().top <= 16;
  }

  private updateActiveSection(): void {
    const viewportOffset = window.innerHeight * 0.28;

    for (const item of this.navItems) {
      const section = document.getElementById(item.id);

      if (!section) {
        continue;
      }

      const rect = section.getBoundingClientRect();

      if (rect.top <= viewportOffset && rect.bottom > viewportOffset) {
        this.activeSection = item.id;
      }
    }
  }
}
