import React from 'react';
import { Box, Flex, VStack } from '@chakra-ui/react';

const Timeline = ({ children }) => {
  const childrenArr = React.Children.toArray(children);

  return (
    <Box position='relative' mx='auto' w='100%' py={8}>
      <Box
        position='absolute'
        left='50%'
        top={0}
        transform='translateX(-50%)'
        height='100%'
        width='2px'
        bg='brand.green'
        zIndex={0}
      />

      <VStack spacing={10} align='stretch' zIndex={1}>
        {childrenArr.map((child, idx) => {
          const isLeft = idx % 2 === 0;

          return (
            <Flex key={idx} position='relative' w='100%' align='center'>
              <Box w='50%' display='flex' justifyContent={isLeft ? 'flex-end' : 'flex-start'} pr={isLeft ? 6 : 0}>
                {isLeft ? child : null}
              </Box>

              <Box
                position='absolute'
                left='50%'
                transform='translateX(-50%)'
                h={4}
                w={4}
                bg='brand.greenDark'
                borderRadius='full'
                boxShadow='md'
              />

              <Box w='50%' display='flex' justifyContent={isLeft ? 'flex-start' : 'flex-start'} pl={isLeft ? 0 : 6}>
                {!isLeft ? child : null}
              </Box>
            </Flex>
          );
        })}
      </VStack>
    </Box>
  );
};

export default Timeline;
