/**
 * Calculates the angle between three points in degrees
 * @param {Object} p1 - First point {x, y}
 * @param {Object} p2 - Middle point {x, y}
 * @param {Object} p3 - Last point {x, y}
 * @returns {number} - Angle in degrees
 */
export const calculateAngle = (p1, p2, p3) => {
    if (!p1 || !p2 || !p3) return 0;
  
    // Convert to vectors
    const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
  
    // Calculate dot product
    const dotProduct = v1.x * v2.x + v1.y * v2.y;
  
    // Calculate magnitudes
    const v1Mag = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const v2Mag = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  
    // Calculate the angle in radians
    const cos = dotProduct / (v1Mag * v2Mag);
  
    // Convert to degrees
    let angle = Math.acos(Math.min(Math.max(cos, -1), 1)) * (180 / Math.PI);
  
    return angle;
  };
  
  /**
   * Gets a map of keypoints by name from a pose
   * @param {Object} pose - Pose object from detector
   * @returns {Object} - Map of keypoints by name
   */
  export const getKeypointsByName = (pose) => {
    if (!pose || !pose.keypoints) return {};
  
    const keypointMap = {};
    pose.keypoints.forEach(kp => {
      keypointMap[kp.name] = kp;
    });
  
    return keypointMap;
  };
  
  /**
   * Calculates the distance between two points
   * @param {Object} p1 - First point {x, y}
   * @param {Object} p2 - Second point {x, y}
   * @returns {number} - Distance
   */
  export const calculateDistance = (p1, p2) => {
    if (!p1 || !p2) return 0;
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };