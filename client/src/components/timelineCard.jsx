import { useState } from 'react';
import { Box, Button } from '@chakra-ui/react';

const TimelineCard = ({ children, header }) => {
  const [open, setOpen] = useState(false);

  return (
    <Box
      width={'100%'}
      maxHeight={'200px'}
      overflow={'auto'}
      border={'1px solid grey.200'}
      borderRadius={'md'}
      p={4}
      bg={'white'}
      boxShadow={'md'}
    >
      <Button
        variant={'solid'}
        bgColor='brand.green'
        color='white'
        _hover={{ bgColor: 'brand.greenDark', textDecoration: 'underline' }}
        width={'100%'}
        onClick={() => setOpen(!open)}
      >
        {header}
      </Button>
      {open && children && <Box mt={4}>{children}</Box>}
    </Box>
  );
};

export default TimelineCard;
