module.exports = {
  locales: {
    '/': {
      lang: 'en-US',
      title: 'Vue Test Utils',
      description: 'Utilities for testing Vue components'
    },
    '/ja/': {
      lang: 'ja',
      title: 'Vue Test Utils',
    },
    '/zh/': {
      lang: 'zh-CN',
      title: 'Vue Test Utils',
    }
  },
  serviceWorker: true,
  theme: 'vue',
  themeConfig: {
    repo: 'vuejs/vue-test-utils',
    docsDir: 'docs',
    locales: {
      '/': {
        label: 'English',
        selectText: 'Languages',
        editLinkText: 'Edit this page on GitHub',
        nav: [
          {
            text: 'API',
            link: '/api/'
          },
          {
            text: 'Guides',
            link: '/guides/'
          }
        ],
        sidebar: [
          '/',
          '/guides/',
          '/api/wrapper/',
          '/api/wrapper-array/',
          '/api/options',
          '/api/components'
        ]
      },
      '/zh/': {
        label: '简体中文',
        selectText: '选择语言',
        editLinkText: '在 GitHub 上编辑此页'
      },
      '/ja/': {
        label: '?',
        selectText: '?',
        editLinkText: '?'
      }
    }
  },
  markdown: {
    config: md => {
      // use more markdown-it plugins!
      md.use(require('markdown-it-include'))
    }
  }
}