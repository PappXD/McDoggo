module.exports = (sequelize, DataTypes) => {
	return sequelize.define('premiumusers', {
		user_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		premium: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
	}, {
		timestamps: false,
	});
};