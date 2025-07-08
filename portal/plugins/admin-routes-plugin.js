module.exports = function adminRoutesPlugin(context, options) {
  return {
    name: 'admin-routes-plugin',
    
    async contentLoaded({ content, actions }) {
      const { addRoute } = actions;
      
      // Add a catch-all route for /admin/*
      await addRoute({
        path: '/admin/*',
        component: '@site/src/pages/admin.tsx',
        exact: false,
        priority: -1, // Lower priority so specific routes take precedence
      });
    },
  };
};