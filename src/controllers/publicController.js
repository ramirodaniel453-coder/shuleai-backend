const getPublicDutyView = async (req, res) => {
  try {
    res.json({ success: true, message: 'Get public duty view endpoint' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPublicWeeklyDuty = async (req, res) => {
  try {
    res.json({ success: true, message: 'Get public weekly duty endpoint' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSchoolInfo = async (req, res) => {
  try {
    res.json({ success: true, message: 'Get public school info endpoint' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPublicDutyView,
  getPublicWeeklyDuty,
  getSchoolInfo
};