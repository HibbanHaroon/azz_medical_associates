import React from "react";
import Slider from "react-slick";
import { Container } from "@mui/material";
import IndividualClinicScreen from "./IndividualClinicScreen"; // Adjust the import according to your file structure

const CarouselComponent = ({ clinicId, clinicName }) => {
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  const userTypes = ["doctor", "nurse", "moderator", "admin"];

  return (
    <Container maxWidth="md">
      <Slider {...settings}>
        {userTypes.map((type) => (
          <div key={type}>
            <IndividualClinicScreen
              clinicId={clinicId}
              clinicName={clinicName}
              userType={type}
            />
          </div>
        ))}
      </Slider>
    </Container>
  );
};

export default CarouselComponent;
