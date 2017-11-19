# Wrapper

vue-test-utils é uma API baseada em *wrapper*.

Um `Wrapper` é um objeto que contém um componente montado ou um vnode e alguns métodos para testar esse item envelopado.

- **Propriedades:**

`vm` `Component`: é uma instância Vue. Você pode acessar todos os [métodos de instância e propriedades de um vm](https://vuejs.org/v2/api/#Instance-Properties) com o `wrapper.vm`. Ela só exite em wrappers de componentes Vue.

`element` `HTMLElement`: elemento raiz do DOM do wrapper.

`options` `Object`: Objeto que contém as opções do vue-test-utils para ser passado para o `mount` ou `shallow`.

- **Métodos:**

Exite uma lista detalhada de métodos na seção Wrapper dessa documentação.
