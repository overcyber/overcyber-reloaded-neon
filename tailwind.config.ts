
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				cyber: ['Orbitron', 'sans-serif'],
				mono: ['Share Tech Mono', 'monospace'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				cyber: {
					'neon': '#9b87f5', // dark theme
					'purple': '#8B5CF6', // dark theme
					'orange': '#F97316', // dark theme
					'blue': '#0EA5E9', // dark theme
					'black': '#1A1F2C', // dark theme
					'dark': '#221F26', // dark theme
					'teal': '#15AABF', // light theme
					'yellow': '#F59E0B', // light theme
					'mint': '#10B981', // light theme
					'light': '#F3F4F6', // light theme
					'lightblue': '#93C5FD', // light theme
					'lightdark': '#E5E7EB', // light theme
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				glitch: {
					'0%': { transform: 'translate(0)' },
					'20%': { transform: 'translate(-2px, 2px)' },
					'40%': { transform: 'translate(-2px, -2px)' },
					'60%': { transform: 'translate(2px, 2px)' },
					'80%': { transform: 'translate(2px, -2px)' },
					'100%': { transform: 'translate(0)' }
				},
				'neon-pulse': {
					'0%': { textShadow: '0 0 5px rgba(0,0,0,0.2), 0 0 10px rgba(21,170,191,0.7), 0 0 15px rgba(21,170,191,0.5)' },
					'50%': { textShadow: '0 0 10px rgba(0,0,0,0.2), 0 0 15px rgba(21,170,191,0.8), 0 0 20px rgba(21,170,191,0.6)' },
					'100%': { textShadow: '0 0 5px rgba(0,0,0,0.2), 0 0 10px rgba(21,170,191,0.7), 0 0 15px rgba(21,170,191,0.5)' }
				},
				'dark-neon-pulse': {
					'0%': { textShadow: '0 0 5px #fff, 0 0 10px #9b87f5, 0 0 15px #8B5CF6, 0 0 20px #8B5CF6' },
					'50%': { textShadow: '0 0 10px #fff, 0 0 15px #9b87f5, 0 0 20px #8B5CF6, 0 0 25px #8B5CF6' },
					'100%': { textShadow: '0 0 5px #fff, 0 0 10px #9b87f5, 0 0 15px #8B5CF6, 0 0 20px #8B5CF6' }
				},
				'border-flow': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' }
				},
				flicker: {
					'0%': { opacity: '0.8' },
					'10%': { opacity: '0.4' },
					'20%': { opacity: '0.8' },
					'30%': { opacity: '1' },
					'40%': { opacity: '0.4' },
					'50%': { opacity: '0.8' },
					'60%': { opacity: '0.4' },
					'70%': { opacity: '0.8' },
					'80%': { opacity: '1' },
					'90%': { opacity: '0.4' },
					'100%': { opacity: '0.8' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'glitch': 'glitch 0.5s ease infinite',
				'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
				'dark-neon-pulse': 'dark-neon-pulse 2s ease-in-out infinite',
				'border-flow': 'border-flow 3s ease infinite',
				'flicker': 'flicker 2s linear infinite'
			},
			backgroundImage: {
				'cyber-grid': 'linear-gradient(rgba(0, 0, 0, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.3) 1px, transparent 1px)',
				'cyber-light-grid': 'linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)',
				'cyber-gradient': 'linear-gradient(90deg, #1A1F2C 0%, #221F26 100%)',
				'cyber-light-gradient': 'linear-gradient(90deg, #F3F4F6 0%, #E5E7EB 100%)'
			},
			backgroundSize: {
				'cyber-grid': '20px 20px'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
