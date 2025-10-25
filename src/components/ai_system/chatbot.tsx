import React, { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../../types';
import '../../styles/chatbot.scss';

interface ChatbotProps {
	onSendMessage?: (message: string, file?: File) => void;
	selectedModel?: string;
	onModelChange?: (model: string) => void;
}

const formatTime = (d = new Date()) => {
	return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const AI_MODELS = [
	{ id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
	{ id: 'claude-3.5', name: 'Claude 3.5' },
	{ id: 'openfoam', name: 'OpenFOAM' },
	{ id: 'gemini-pro', name: 'Gemini Pro' }
];

const Chatbot: React.FC<ChatbotProps> = ({ 
	onSendMessage, 
	selectedModel = AI_MODELS[0].id,
	onModelChange 
}) => {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [input, setInput] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		// initial welcome message
		setMessages([
			{ type: 'ai', content: 'Hello — I can help with your simulation. Ask me anything!', time: formatTime() }
		]);
	}, []);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, isTyping]);

	const sendMessage = (file?: File) => {
		const trimmed = input.trim();
		if (!trimmed && !file) return;

		const userMsg: ChatMessage = { type: 'user', content: trimmed || (file ? `Uploaded ${file.name}` : ''), time: formatTime(), file: undefined };
		setMessages((m) => [...m, userMsg]);

		if (onSendMessage) onSendMessage(trimmed, file);

		setInput('');
		setIsTyping(true);

		// Mock AI reply after short delay
		setTimeout(() => {
			const reply: ChatMessage = {
				type: 'ai',
				content: file ? `I've received ${file.name}. What would you like me to analyze?` : `Echo: ${trimmed}`,
				time: formatTime()
			};
			setMessages((m) => [...m, reply]);
			setIsTyping(false);
		}, 700 + Math.random() * 800);
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			sendMessage(file);
		}
		// reset so same file can be uploaded again later if needed
		if (e.target) e.target.value = '';
	};

	return (
		<div className="chat-container d-flex flex-column rounded-3 shadow-lg" style={{ maxHeight: 'calc(100vh - 92px)' }}>
			{/* Header with AI Model selector */}
			<div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary">
				<div className="d-flex align-items-center gap-3">
					<img src="/curfdlogo.png" alt="CURFD" style={{ height: '24px' }} />
					<div>
						<strong className="text-white">CURFD AI</strong>
					</div>
				</div>
				
				<select
					value={selectedModel}
					onChange={(e) => onModelChange?.(e.target.value)}
					className="form-select form-select-sm chat-input rounded-pill px-3"
					style={{ width: 'auto', backgroundColor: 'rgba(255,255,255,0.1)' }}
				>
					{AI_MODELS.map(model => (
						<option key={model.id} value={model.id}>
							{model.name}
						</option>
					))}
				</select>
			</div>

			<div className="flex-grow-1 p-3" style={{ overflowY: 'auto', maxHeight: '60vh' }}>
				{messages.map((m, i) => (
					<div key={i} className={`mb-4 ${m.type === 'user' ? 'text-end' : 'text-start'}`}>
						{m.type === 'ai' && (
							<div className="d-flex align-items-center mb-2">
								<div className="p-1 me-2" style={{ background: 'var(--brand-gradient)', borderRadius: '50%' }}>
									<i className="fas fa-robot text-white" style={{ fontSize: 12 }} />
								</div>
								<div className="d-flex align-items-center gap-2">
									<span className="text-white fw-medium">CURFD AI</span>
									<span className="text-white-50 small">{m.time}</span>
								</div>
							</div>
						)}

						<div className={`message-bubble ${m.type === 'user' ? 'user' : 'ai'}`}>
							{m.content}
						</div>

						{m.type === 'user' && (
							<div className="text-white-50 small mt-1">{m.time}</div>
						)}
					</div>
				))}

				{isTyping && (
					<div className="text-start mb-3">
						<div className="d-flex align-items-center mb-1">
							<div className="bg-primary rounded-circle p-1 me-2">
								<i className="fas fa-robot text-white" style={{ fontSize: 12 }} />
							</div>
							<small className="text-primary">AI</small>
						</div>
						<div className="bg-secondary bg-opacity-25 text-white p-3 rounded d-inline-block border border-secondary">
							<div className="d-flex align-items-center gap-2 text-muted">
								<span>Typing</span>
								<div className="d-flex gap-1">
									<div className="bg-primary rounded-circle" style={{ width: 6, height: 6 }} />
									<div className="bg-primary rounded-circle" style={{ width: 6, height: 6 }} />
									<div className="bg-primary rounded-circle" style={{ width: 6, height: 6 }} />
								</div>
							</div>
						</div>
					</div>
				)}

				<div ref={messagesEndRef} />
			</div>

			{/* Chat Input */}
			<div className="p-3 mt-auto">
				<div className="d-flex gap-2">
					<div className="input-group">
						<input
							type="text"
							className="chat-input form-control rounded-start-pill px-3 py-2"
							placeholder="Type your message..."
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={onKeyDown}
						/>

						<button 
							type="button" 
							className="btn chat-input rounded-0 px-3"
							onClick={() => document.getElementById('chat-file-input')?.click()}
							title="Upload file"
							style={{ borderLeft: '1px solid var(--chat-border)', borderRight: '1px solid var(--chat-border)' }}
						>
							<i className="fas fa-paperclip text-white-50" />
						</button>

						<button 
							type="button"
							className={`btn rounded-end-pill px-4 ${input.trim() ? 'btn-brand' : 'chat-input'}`}
							onClick={() => sendMessage()}
							disabled={isTyping || (!input.trim())}
						>
							<i className="fas fa-paper-plane" />
						</button>
					</div>
				</div>
				<input id="chat-file-input" type="file" className="d-none" onChange={handleFileChange} accept=".stl,.obj,.step,.stp,.iges,.glb" />
			</div>
		</div>
	);
};

export default Chatbot;
