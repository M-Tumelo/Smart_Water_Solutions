
const geojson = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [28.2292712, -25.7478676]
            },
            properties: {
                title: 'Mapbox',
                description: 'Home'
            }
        },
        {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [28.229271, -28.7478676]
            },
            properties: {
                title: 'Mapbox',
                description: 'this Is so Funny'
            }
        }
    ]
};

exports.getQueries = async (req, res, next) => {
    try {
      const geojson = await geojson;
  
      return res.status(200).json({
        data: geojson
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }