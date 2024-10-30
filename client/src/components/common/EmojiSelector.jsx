import { Box, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const EmojiSelector = props => {
  const [selectedEmoji, setSelectedEmoji] = useState();
  const [isShowSelector, setIsShowSelector] = useState(false);

  useEffect(() => {
    setSelectedEmoji(props.icon)
  }, [props.icon]);

  const selectEmoji = (e) => {
    const sym = e.unified.split('-');
    let codesArray = [];
    sym.forEach(el => codesArray.push('0x' + el));
    const emoji = String.fromCodePoint(...codesArray);
    setIsShowSelector(false);
    props.onChange(emoji);
  }

  const showSelector = () => setIsShowSelector(!isShowSelector);

  return (
    <Box sx={{ position: 'relative', width: 'max-content' }}>
      <Typography
        variant='h3'
        fontWeight='700'
        sx={{ cursor: 'pointer' }}
        onClick={showSelector}
      >
        {selectedEmoji}
      </Typography>
      <Box sx={{
        display: isShowSelector ? 'block' : 'none',
        position: 'absolute',
        top: '100%',
        zIndex: '9999'
      }}>
        <Picker data={data} theme='dark' onEmojiSelect={selectEmoji} />
      </Box>
    </Box>
  )
}

export default EmojiSelector