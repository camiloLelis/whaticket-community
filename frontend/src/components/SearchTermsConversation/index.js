import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import api from "../../services/api";
import toastError from "../../errors/toastError";

const SearchMessages = () => {
    const { ticketId } = useParams();
    const [searchTerm, setSearchTerm] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef(null);

    const handleChange = useCallback((e) => setSearchTerm(e.target.value), []);

    const regex = useMemo(() => new RegExp(`(${searchTerm})`, "gi"), [searchTerm]);

    const highlightTerm = useCallback((text) => text.replace(regex, "<strong>$1</strong>"), [regex]);

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
        <li ref={lastMessageRef}>
            <h6>
                {new Date(message._source.message_date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                })}
            </h6>
            <p dangerouslySetInnerHTML={{ __html: message.contentWithHighlight }}></p>
        </li>
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
            {!hasMore && messages.length > 0 && <p>Você chegou ao fim!</p>}
        </div>
    );
};

export default SearchMessages;
