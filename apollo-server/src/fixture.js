
const insertPredefinedData = async (models) => {
  setTimeout(async () => {
    await models.User.findOne({ roles: 'SuperAdmin' }).exec(
      async (err, res) => {
        if (!res) {
          const user1 = new models.User({
            userName: 'admin',
            roles: "SuperAdmin",
            email: 'admin@admin.com',
            password: 'password',
            phone: '9999999999',
            address:"Surat"
          });

          await user1.save();
          return true;
        } else return true;
      },
    );
  }, 2000);


  return true;
};

export default insertPredefinedData;
