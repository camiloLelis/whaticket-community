import React, { useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { Tooltip, makeStyles } from '@material-ui/core';

import openSocket from "../../services/socket-io";



const useStyles = makeStyles((theme) => ({
    clickableMessageItem: {
      cursor: "pointer", /* Ícone de mãozinha */
      padding: "10px",
      borderRadius: "5px",
      transition: "background-color 0.3s ease", /* Transição suave */
      
      // Aplica o estilo de hover diretamente no item
      "&:hover": {
        backgroundColor: "#f0f0f0", /* Cor de fundo ao passar o mouse */
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        color: "#007BFF", /* Mudança de cor do texto */
        fontWeight: "bold", /* Torna o texto em negrito */
        transform: "scale(1.05)", /* Aumenta o tamanho ao passar o mouse */
      },
    },
  }));
  

const SearchMessages = ({onClose}) => {
    const { ticketId } = useParams();
    const [searchTerm, setSearchTerm] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef(null);
    const { valueSearch, setValueSearch } = useContext(ReplyMessageContext); 
    const classes = useStyles();

    const handleChange = useCallback((e) => setSearchTerm(e.target.value), []);

    const regex = useMemo(() => new RegExp(`(${searchTerm})`, "gi"), [searchTerm]);

    const highlightTerm = useCallback((text) => text.replace(regex, "<strong>$1</strong>"), [regex]);

    const setAndClose = useCallback(async(message) => {
        await api.get(`/searchMessage/${ticketId}`, { params: { id : message._id, date: message._source.message_date} });
        await setValueSearch(message._source);
        onClose();
    }, [onClose]);

    const handleSearch = useCallback(async (currentPage) => {
        if (!searchTerm.trim()) {
            setMessages([]);
            setHasMore(false);
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.get(`/search/${ticketId}`, { params: { query: searchTerm, page: currentPage } });
            const totalMatches = data[1];
            const highlightedMessages = data[0].map((message) => ({
                ...message,
                contentWithHighlight: highlightTerm(message._source.message_body),
               
            }));
            setMessages((prevMessages) => 
                currentPage === 1 ? highlightedMessages : [...prevMessages, ...highlightedMessages]
            );
            setHasMore(totalMatches > 1);
        } catch (error) {
            toastError(error);
        } finally {
            setLoading(false);
        }
    }, [highlightTerm, searchTerm, ticketId]);

    useEffect(() => {
      setPage(1);
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.trim()) {
                handleSearch(1);
            } else {
                setMessages([]);
            }
        }, 1000);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const lastMessageRef = useCallback((node) => {
        if (loading || !hasMore) return;

        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setPage((prevPage) => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    useEffect(() => {
        if (page > 1) {
            handleSearch(page);
        }
    }, [page, handleSearch]);

    const MessageItem = React.memo(({ message, lastMessageRef }) => (
        <Tooltip title="Clique para direcionar até a mensagem" arrow>
        <li ref={lastMessageRef} 
            onClick={() => setAndClose(message)}
            className={classes.clickableMessageItem}>
            <h6>
                {new Date(message._source.message_date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                })}
            </h6>
            <p dangerouslySetInnerHTML={{ __html: message.contentWithHighlight }}></p>
                
        </li>
        </Tooltip>
    ));

    return (
        <div>
            <input
                type="text"
                placeholder="Digite para buscar mensagens..."
                value={searchTerm}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', marginBottom: '12px' }}
            />
            {loading && page === 1 && <p>Carregando...</p>}
            <ul>
                {messages.length === 0 && !loading ? (
                    <li>Nenhuma mensagem encontrada.</li>
                ) : (
                    messages.map((message, index) => (
                        <MessageItem
                            key={message.id}
                            message={message}
                            lastMessageRef={messages.length === index + 1 ? lastMessageRef : null}

                        />
                    ))
                )}
            </ul>
            {loading && page > 1 && <p>Carregando...</p>}
            {!hasMore && messages.length > 0 && <p>essas foram as mensagens encontradas</p>}
        </div>
    );
};

export default SearchMessages;
