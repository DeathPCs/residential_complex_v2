import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const LandingCarousel = ({ features }) => {
  return (
    <Box
      sx={{
        maxWidth: '100%',
        px: { xs: 4, sm: 10 },
        py: 3,
      }}
    >
      <Swiper
        modules={[Navigation, A11y]}
        slidesPerView={1}
        navigation={{
          prevEl: '.swiper-button-prev',
          nextEl: '.swiper-button-next',
        }}
        style={{ paddingBottom: 40 }}
      >
        {features.map((feature, index) => (
          <SwiperSlide key={index}>
            <Card
              sx={{
                position: 'relative',
                height: 600,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                boxShadow: 6,
                borderRadius: 4,
                overflow: 'hidden',
                cursor: 'default',
                backgroundColor: '#000',
                backgroundImage: `url(${feature.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'transform 0.4s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 12,
                },
              }}
            >
              {/* Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0.25))',
                }}
              />

              {/* Content */}
              <CardContent
                sx={{
                  position: 'relative',
                  textAlign: 'left',
                  color: 'white',
                  px: 4,
                  pb: 5,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 1000,
                    fontSize: 50,
                    mb: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  }}
                >
                  {feature.title}
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    opacity: 0.9,
                    letterSpacing: '0.01em',
                    textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                    fontSize: 20
                  }}
                >
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </SwiperSlide>
        ))}

        {/* Navigation Buttons */}
        <Box
          component="div"
          className="swiper-button-prev"
          sx={{
            color: 'rgba(0, 0, 0, 0.6)',
            '&:hover': { color: 'primary.main' },
            position: 'absolute',
            top: '50%',
            left: 16,
            zIndex: 20,
            cursor: 'pointer',
            width: 38,
            height: 38,
            transform: 'translateY(-50%)',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.9)',
            boxShadow: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            width="22"
            height="22"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Box>

        <Box
          component="div"
          className="swiper-button-next"
          sx={{
            color: 'rgba(0,0,0,0.6)',
            '&:hover': { color: 'primary.main' },
            position: 'absolute',
            top: '50%',
            right: 16,
            zIndex: 20,
            cursor: 'pointer',
            width: 38,
            height: 38,
            transform: 'translateY(-50%)',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.9)',
            boxShadow: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            width="22"
            height="22"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Box>
      </Swiper>
    </Box>
  );
};

export default LandingCarousel;