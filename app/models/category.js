module.exports = function(sequelize, Sequelize) {
  var Category = sequelize.define("category", {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },

    cat_name: {
      type: Sequelize.TEXT
    },

    status: {
      type: Sequelize.ENUM("active", "inactive"),
      defaultValue: "active"
    }
  });

  Category.categoriesAndChild = async function() {
    let res = await Category.findAll();
    res.forEach(c => {
      c.hasChildCates = false;
      c.getProductTypes().then(childCates => {
        if (childCates.length !== 0) {
          c.hasChildCates = true;
          c.childCates = childCates;
        }
      });
    });
    return res;
  };

  Category.addCat = async cat_name => {
    let sql = `INSERT INTO categories(cat_name, createdAt, updatedAt) VALUES ('${cat_name}', now(), now())`;
    return sequelize.query(sql, {
      type: sequelize.QueryTypes.INSERT
    });
  };

  Category.updateCat = async (cat_id, cat_name) => {
    let sql = `UPDATE categories SET cat_name = '${cat_name}' WHERE id = '${cat_id}';`;
    return sequelize.query(sql, {
      type: sequelize.QueryTypes.UPDATE
    });
  };

  Category.delete = catId => {
    return Category.update(
      {
        status: "inactive"
      },
      {
        where: {
          id: catId
        }
      }
    );
  };

  Category.findById = async id =>{
    let sql = `SELECT * FROM categories WHERE id = ${id}`;
    return sequelize.query(sql, {
      type: sequelize.QueryTypes.SELECT
    });
  };

  return Category;
};
