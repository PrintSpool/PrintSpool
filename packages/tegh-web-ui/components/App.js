export default ({ children }) => (
  <main>
    { /* force pages to be rendered in the browser for dev purposes */ }
    {process.browser ? children : <div/>}
  </main>
)
