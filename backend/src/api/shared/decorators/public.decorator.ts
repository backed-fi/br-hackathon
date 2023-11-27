export const Public = () => (target) => {
  const path = Reflect.getMetadata('path', target);

  Reflect.defineMetadata('path', `/public/${path}`, target);
};
