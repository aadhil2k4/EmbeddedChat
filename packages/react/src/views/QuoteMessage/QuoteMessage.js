import React, { useContext } from 'react';
import { format } from 'date-fns';
import {
  Box,
  Avatar,
  ActionButton,
  Icon,
  useComponentOverrides,
  useTheme,
} from '@embeddedchat/ui-elements';
import RCContext from '../../context/RCInstance';
import { useMessageStore } from '../../store';
import getQuoteMessageStyles from './QuoteMessage.styles';
import Attachment from '../AttachmentHandler/Attachment';
import { Markdown } from '../Markdown';

const QuoteMessage = ({ className = '', style = {}, message }) => {
  const { RCInstance } = useContext(RCContext);
  const instanceHost = RCInstance.getHost();
  const getUserAvatarUrl = (username) => {
    const host = instanceHost;
    const URL = `${host}/avatar/${username}`;
    return URL;
  };
  const { theme } = useTheme();
  const styles = getQuoteMessageStyles(theme);
  const removeQuoteMessage = useMessageStore(
    (state) => state.removeQuoteMessage
  );

  const { classNames, styleOverrides } = useComponentOverrides('QuoteMessage');
  return (
    <Box
      className={`ec-quote-msg ${className} ${classNames}`}
      style={{ ...styleOverrides, ...style }}
      css={styles.messageContainer}
    >
      <Box css={styles.actionBtn}>
        <ActionButton
          ghost
          onClick={() => removeQuoteMessage(message)}
          size="small"
        >
          <Icon name="cross" size="0.75rem" />
        </ActionButton>
      </Box>
      <Box css={styles.avatarContainer}>
        <Avatar
          url={getUserAvatarUrl(message?.u.username)}
          alt="avatar"
          size="1.5em"
        />
        <Box>{message?.u.username}</Box>
        <Box>{format(new Date(message.ts), 'h:mm a')}</Box>
      </Box>
      <Box css={styles.message}>
        {message.file ? (
          message.file.type.startsWith('image/') ? (
            <div>
              <img
                src={`${instanceHost}/file-upload/${message.file._id}/${message.file.name}`}
                alt={message.file.name}
                style={{ maxWidth: '100px', maxHeight: '100px' }}
              />
              <div>{`${message.file.name} (${(message.file.size / 1024).toFixed(
                2
              )} kB)`}</div>
            </div>
          ) : message.file.type.startsWith('video/') ? (
            <video controls style={{ maxWidth: '100%', maxHeight: '200px' }}>
              <source
                src={`${instanceHost}/file-upload/${message.file._id}/${message.file.name}`}
                type={message.file.type}
              />
              Your browser does not support the video tag.
            </video>
          ) : message.file.type.startsWith('audio/') ? (
            <audio controls style={{ maxWidth: '100%' }}>
              <source
                src={`${instanceHost}/file-upload/${message.file._id}/${message.file.name}`}
                type={message.file.type}
              />
              Your browser does not support the audio element.
            </audio>
          ) : (
            <Box css={styles.message}>
              {message.msg ? (
                <Markdown body={message} isReaction={false} />
              ) : (
                `${message.file?.name} (${
                  message.file?.size ? (message.file.size / 1024).toFixed(2) : 0
                } kB)`
              )}
            </Box>
          )
        ) : message?.msg[0] === '[' ? (
          message?.msg.match(/\n(.*)/)[1]
        ) : (
          <Markdown body={message} isReaction={false} />
        )}
        {message.attachments &&
          message.attachments.length > 0 &&
          message.msg &&
          message.msg[0] === '[' &&
          message.attachments.map((attachment, index) => (
            <Attachment
              key={index}
              attachment={attachment}
              type={attachment.type}
              host={instanceHost}
            />
          ))}
      </Box>
    </Box>
  );
};

export default QuoteMessage;
