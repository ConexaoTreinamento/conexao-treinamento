import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test-setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'components/auth/login-card.tsx',
        'components/base/empty-state.tsx',
        'components/base/page-header.tsx',
        'components/base/section.tsx',
        'components/base/stat-card.tsx',
        'components/base/status-badge.tsx',
        'components/events/event-card.tsx',
        'components/plans/plan-card.tsx',
        'components/students/student-card.tsx',
        'components/trainers/trainer-select.tsx',
        'components/ui/badge.tsx',
        'components/ui/button.tsx',
        'components/ui/card.tsx',
        'components/ui/input.tsx',
        'components/ui/label.tsx',
        'components/ui/skeleton.tsx',
        'hooks/use-debounce.ts',
        'hooks/use-toast.ts',
        'lib/error-utils.ts',
        'lib/evaluations/transform.ts',
        'lib/exercises/query-utils.ts',
        'lib/formatters/time.ts',
        'lib/schedule/hooks/session-mutations.ts',
        'lib/students/student-form-transforms.ts',
        'lib/time-helpers.ts',
        'lib/utils.ts',
      ],
      exclude: [
        '**/*.d.ts',
        '**/node_modules/**',
        '**/.next/**',
        'app/**/*',
        'lib/api-client/**/*',
        'lib/**/?(*.)gen.ts',
        'components/**/*.stories.tsx',
        'components/**/page.tsx',
        'components/**/page-view.tsx',
        'components/**/view.tsx',
        'components/**/modal.tsx',
        'components/**/dialogs/**/*',
        'components/**/forms/**/*',
      ],
      thresholds: {
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})

