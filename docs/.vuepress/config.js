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
      description: 'Vue コンポーネントをテストするためのユーティリティ'
    },
    '/zh/': {
      lang: 'zh-CN',
      title: 'Vue Test Utils',
      description: '测试 Vue 组件的实用工具'
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
          '/api/',
          '/api/wrapper/',
          '/api/wrapper-array/',
          '/api/options',
          '/api/components/'
        ]
      },
      '/zh/': {
        label: '简体中文',
        selectText: '选择语言',
        editLinkText: '在 GitHub 上编辑此页',
        nav: [
          {
            text: 'API',
            link: '/zh/api/'
          },
          {
            text: '教程',
            link: '/zh/guides/'
          }
        ],
        sidebar: [
          '/zh/',
          '/zh/guides/',
          '/zh/api/',
          '/zh/api/wrapper/',
          '/zh/api/wrapper-array/',
          '/zh/api/options',
          '/zh/api/components/'
        ]
      },
      '/ja/': {
        label: '日本語',
        selectText: '言語',
        editLinkText: 'GitHub 上でこのページを編集する',
        nav: [
          {
            text: 'API',
            link: '/ja/api/'
          },
          {
            text: 'ガイド',
            link: '/ja/guides/'
          }
        ],
        sidebar: [
          '/ja/',
          '/ja/guides/',
          '/ja/api/',
          '/ja/api/wrapper/',
          '/ja/api/wrapper-array/',
          '/ja/api/options',
          '/ja/api/components/'
        ]
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