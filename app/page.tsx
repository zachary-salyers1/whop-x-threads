'use client';

import { useState } from 'react';
import { Play, MessageCircle, RotateCcw, Copy, Check } from 'lucide-react';

export default function Page() {
	const [youtubeUrl, setYoutubeUrl] = useState('');
	const [threadLength, setThreadLength] = useState(5);
	const [isGenerating, setIsGenerating] = useState(false);
	const [threads, setThreads] = useState<string[]>([]);
	const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

	const handleGenerate = async () => {
		if (!youtubeUrl.trim()) return;
		
		setIsGenerating(true);
		try {
			const response = await fetch('/api/generate-thread', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					youtubeUrl,
					threadLength,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to generate thread');
			}

			setThreads(data.threads);
		} catch (error) {
			console.error('Error generating threads:', error);
			alert(error instanceof Error ? error.message : 'Failed to generate thread');
		} finally {
			setIsGenerating(false);
		}
	};

	const handleReset = () => {
		setYoutubeUrl('');
		setThreads([]);
		setThreadLength(5);
		setCopiedIndex(null);
	};

	const handleCopy = async (text: string, index: number) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedIndex(index);
			setTimeout(() => setCopiedIndex(null), 2000);
		} catch (error) {
			console.error('Failed to copy:', error);
		}
	};

	const handleCopyAll = async () => {
		const allThreads = threads.map((thread, index) => `${index + 1}/${threads.length} ${thread}`).join('\n\n');
		try {
			await navigator.clipboard.writeText(allThreads);
			setCopiedIndex(-1); // Special index for "copy all"
			setTimeout(() => setCopiedIndex(null), 2000);
		} catch (error) {
			console.error('Failed to copy all:', error);
		}
	};

	return (
		<div className="min-h-screen bg-black text-white">
			<div className="max-w-2xl mx-auto pt-8 pb-12 px-4">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold mb-2">X Thread Generator</h1>
					<p className="text-gray-400">Transform YouTube videos into engaging X threads</p>
				</div>

				{/* Input Section */}
				<div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
					<div className="space-y-4">
						<div>
							<label htmlFor="youtube-url" className="block text-sm font-medium mb-2">
								YouTube Video URL
							</label>
							<input
								id="youtube-url"
								type="url"
								value={youtubeUrl}
								onChange={(e) => setYoutubeUrl(e.target.value)}
								placeholder="https://www.youtube.com/watch?v=..."
								className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
							/>
						</div>

						<div>
							<label htmlFor="thread-length" className="block text-sm font-medium mb-2">
								Thread Length: {threadLength} tweets
							</label>
							<input
								id="thread-length"
								type="range"
								min="3"
								max="15"
								value={threadLength}
								onChange={(e) => setThreadLength(Number(e.target.value))}
								className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
							/>
							<div className="flex justify-between text-xs text-gray-500 mt-1">
								<span>3</span>
								<span>15</span>
							</div>
						</div>

						<div className="flex gap-3 pt-2">
							<button
								onClick={handleGenerate}
								disabled={!youtubeUrl.trim() || isGenerating}
								className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
							>
								{isGenerating ? (
									<>
										<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
										Generating...
									</>
								) : (
									<>
										<Play className="w-4 h-4" />
										Generate Thread
									</>
								)}
							</button>
							
							{threads.length > 0 && (
								<button
									onClick={handleReset}
									className="px-4 py-3 border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
								>
									<RotateCcw className="w-4 h-4" />
								</button>
							)}
						</div>
					</div>
				</div>

				{/* Thread Display */}
				{threads.length > 0 && (
					<div className="space-y-4">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<MessageCircle className="w-5 h-5 text-blue-400" />
								<h2 className="text-xl font-semibold">Generated Thread</h2>
							</div>
							<button
								onClick={handleCopyAll}
								className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors"
							>
								{copiedIndex === -1 ? (
									<>
										<Check className="w-4 h-4 text-green-400" />
										Copied!
									</>
								) : (
									<>
										<Copy className="w-4 h-4" />
										Copy All
									</>
								)}
							</button>
						</div>
						
						{threads.map((thread, index) => (
							<div key={index} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
								<div className="flex items-start gap-3">
									<div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
										{index + 1}
									</div>
									<div className="flex-1">
										<div className="flex items-center justify-between mb-2">
											<div className="flex items-center gap-2">
												<span className="font-semibold">Your Username</span>
												<span className="text-gray-500 text-sm">@yourusername</span>
												<span className="text-gray-500 text-sm">·</span>
												<span className="text-gray-500 text-sm">now</span>
											</div>
											<button
												onClick={() => handleCopy(thread, index)}
												className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
											>
												{copiedIndex === index ? (
													<Check className="w-4 h-4 text-green-400" />
												) : (
													<Copy className="w-4 h-4" />
												)}
											</button>
										</div>
										<p className="text-white leading-relaxed">{thread}</p>
										
										{index < threads.length - 1 && (
											<div className="mt-3 text-blue-400 text-sm">
												🧵 Thread continues...
											</div>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
