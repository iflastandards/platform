const useBaseUrl = (path: string) => {
  if (typeof path !== 'string') {return path;}
  if (path.startsWith('/') || path.startsWith('http')) {return path;}
  return '/' + path;
};
export default useBaseUrl; 