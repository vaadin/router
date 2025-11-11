// tag::snippet[]
window.dispatchEvent(
  new CustomEvent('vaadin-router-go', {
    detail: {
      pathname: '/to/path',
      // optional search query string
      search: '?paramName=value',
      // optional hash string
      hash: '#sectionName',
    },
  }),
);
// end::snippet[]

export {};
