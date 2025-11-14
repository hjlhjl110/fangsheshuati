/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 医务人员专业配色方案 - 优化对比度和可读性
        primary: {
          // 活力橙 - 用于关键操作和重要信息
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#FF6B6B', // 主色调 - 活力橙
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407', // 增加深色以增强对比度
        },
        secondary: {
          // 静谧蓝 - 用于辅助信息和安抚元素
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#4ECDC4', // 辅助色 - 静谧蓝
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#022c22', // 增加深色以增强对比度
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // 医疗专业色调
        medical: {
          blue: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
          },
          teal: {
            50: '#f0fdfa',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#14b8a6',
            600: '#0d9488',
            700: '#0f766e',
            800: '#115e59',
            900: '#134e4a',
          }
        },
        // 深色模式专用色彩 - 医务人员夜间护眼配色
        dark: {
          bg: {
            primary: '#0a0e1a', // 深邃医疗蓝
            secondary: '#1a1f2e', // 次级背景
            tertiary: '#2a3444', // 三级背景
            card: '#1e2937', // 卡片背景
            input: '#2d3748', // 输入框背景
            overlay: 'rgba(10, 14, 26, 0.8)', // 遮罩层
          },
          text: {
            primary: '#f7fafc', // 主要文字
            secondary: '#e2e8f0', // 次要文字
            tertiary: '#a0aec0', // 三级文字
            muted: '#718096', // 静音文字
          }
        }
      },
      fontFamily: {
        // 医疗级清晰字体
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Consolas', 'Courier New', 'monospace'],
      },
      fontSize: {
        // 移动端优化字体大小
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      spacing: {
        // 移动端触控优化间距
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // 移动端触控优化尺寸
      minHeight: {
        'touch': '44px', // iOS HIG 最小触控尺寸
        'touch-lg': '48px', // Android Material Design 最小触控尺寸
      },
      minWidth: {
        'touch': '44px',
        'touch-lg': '48px',
      },
      // 移动端优先断点 - 医务人员设备适配
      screens: {
        'xs': '375px',  // iPhone SE - 单手操作优化
        'sm': '414px',  // iPhone 标准尺寸 - 通勤场景
        'md': '768px',  // iPad mini - 午休学习
        'lg': '1024px', // iPad - 横屏模式
        'xl': '1280px', // 小型桌面 - 办公室使用
        '2xl': '1536px', // 桌面 - 详细资料查看
      },
      // 移动端动画
      transitionDuration: {
        'fast': '150ms',
        'normal': '300ms',
        'slow': '500ms',
      },
      // 医疗级阴影
      boxShadow: {
        'medical': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medical-lg': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'inner-medical': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
      // 移动端圆角
      borderRadius: {
        'mobile': '12px',
        'mobile-lg': '16px',
        'mobile-xl': '20px',
      },
      // 层级定义
      zIndex: {
        'mobile-header': 100,
        'mobile-modal': 200,
        'mobile-toast': 300,
        'mobile-keyboard': 400,
      }
    },
  },
  plugins: [],
}