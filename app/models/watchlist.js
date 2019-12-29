module.exports = function(sequelize, Sequelize) {
	var WatchList = sequelize.define('watchlist', {
		id: {
			autoIncrement: true,
			primaryKey: true,
			type: Sequelize.INTEGER
		},
		status: {
			type: Sequelize.ENUM('active', 'inactive'),
			defaultValue: 'active'
		}
	});

	WatchList.actWatchList = async function(userId, proId) {
		let record = await WatchList.findOne({
			where: { productId: proId, userId: userId }
		});

		// console.log(record.dataValues);

		if (record === null) {
			WatchList.create({
				productId: proId,
				userId: userId
			});
			return 1;
		} else {
			// console.log(record.dataValues.status);

			let status =
				record.dataValues.status === 'active' ? 'inactive' : 'active';
			WatchList.update(
				{
					status: status
				},
				{
					returning: false,
					where: { productId: proId, userId: userId }
				}
			);
			return record.dataValues.status === 'active' ? 0 : 1;
		}
	};
	WatchList.findAllProduct = function(userId) {
		let sql = `SELECT * FROM watchlists w ,products p WHERE  w.userId = ${userId} AND w.status= 'active' AND p.id = w.productId`;
		return sequelize.query(sql, {
			type: sequelize.QueryTypes.SELECT
		});
	};
	WatchList.findAllBidProduct = function(userId) {
		let sql = `SELECT distinct (bd.productId),(select max(bd1.price) from bid_details bd1 where  bd1.productId = bd.productId) as price,p.*,bd.userId,u.firstname as winnerfn, u.lastname as winnerln FROM bid_details bd ,products p, users u WHERE  bd.userId = ${userId}  AND p.id = bd.productId AND p.winnerId = u.id ;`;
		return sequelize.query(sql, {
			type: sequelize.QueryTypes.SELECT
		});
	};

	WatchList.findAllWinPro = function(userId) {
		let sql = `SELECT p.*,u.firstname as firstname, u.lastname as lastname FROM bid_details bd ,products p,users u WHERE  bd.userId = ${userId}  AND p.id = bd.productId AND u.id = p.sellerId AND p.expriry_date < NOW() ORDER BY bd.price DESC LIMIT 1 `;
		return sequelize.query(sql, {
			type: sequelize.QueryTypes.SELECT
		});
	};

	return WatchList;
};
