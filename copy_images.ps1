docker cp smarthotel-backend:/frontend/public/images/hotels E:\SmartHotelBooking_Node\frontend\public\images\hotels
docker cp smarthotel-backend:/frontend/public/images/cities E:\SmartHotelBooking_Node\frontend\public\images\cities
docker cp E:\SmartHotelBooking_Node\frontend\public\images\hotels smarthotel-frontend:/usr/share/nginx/html/images/hotels
docker cp E:\SmartHotelBooking_Node\frontend\public\images\cities smarthotel-frontend:/usr/share/nginx/html/images/cities
echo "Images copied successfully."
