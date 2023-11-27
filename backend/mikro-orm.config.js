module.exports = {
  entities: ['./dist/domain/**/model/*.js'],
  dbName: 'br-hackathon',
  migrations: {
    path: './src/persistance/migrations',
  },
  type: 'postgresql',

  port: 5433,
  user: 'postgres',
  password: 'postgres',
};
