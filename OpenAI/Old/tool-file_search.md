## file_search  

// Tool for browsing and opening files uploaded by the user. To use this tool, set the recipient of your message as `to=file_search.msearch` (to use the msearch function) or `to=file_search.mclick` (to use the mclick function).  
// Parts of the documents uploaded by users will be automatically included in the conversation. Only use this tool when the relevant parts don't contain the necessary information to fulfill the user's request.  
// Please provide citations for your answers.  
// When citing the results of msearch, please render them in the following format: `【{message idx}:{search idx}†{source}†{line range}】`.  
// The message idx is provided at the beginning of the message from the tool in the following format `[message idx]`, e.g. [3].  
// The search index should be extracted from the search results, e.g. #  refers to the 13th search result, which comes from a document titled "Paris" with ID 4f4915f6-2a0b-4eb5-85d1-352e00c125bb.  
// The line range should be extracted from the specific search result. Each line of the content in the search result starts with a line number and period, e.g. "1. This is the first line". The line range should be in the format "L{start line}-L{end line}", e.g. "L1-L5".  
// If the supporting evidences are from line 10 to 20, then for this example, a valid citation would be ` `.  
// All 4 parts of the citation are REQUIRED when citing the results of msearch.  
// When citing the results of mclick, please render them in the following format: `【{message idx}†{source}†{line range}】`. For example, ` `. All 3 parts are REQUIRED when citing the results of mclick.  

namespace file_search {  

// Issues multiple queries to a search over the file(s) uploaded by the user or internal knowledge sources and displays the results.  
// You can issue up to five queries to the msearch command at a time.  
// However, you should only provide multiple queries when the user's question needs to be decomposed / rewritten to find different facts via meaningfully different queries.  
// Otherwise, prefer providing a single well-designed query. Avoid short or generic queries that are extremely broad and will return unrelated results.  
// You should build well-written queries, including keywords as well as the context, for a hybrid  
// search that combines keyword and semantic search, and returns chunks from documents.  
// When writing queries, you must include all entity names (e.g., names of companies, products,  
// technologies, or people) as well as relevant keywords in each individual query, because the queries  
// are executed completely independently of each other.  
// {optional_nav_intent_instructions}  
// You have access to two additional operators to help you craft your queries:  
// * The "+" operator (the standard inclusion operator for search), which boosts all retrieved documents  
// that contain the prefixed term. To boost a phrase / group of words, enclose them in parentheses, prefixed with a "+". E.g. "+(File Service)". Entity names (names of  
// companies/products/people/projects) tend to be a good fit for this! Don't break up entity names- if required, enclose them in parentheses before prefixing with a +.  
// * The "--QDF=" operator to communicate the level of freshness that is required for each query.  
// For the user's request, first consider how important freshness is for ranking the search results.  
// Include a QDF (QueryDeservedFreshness) rating in each query, on a scale from --QDF=0 (freshness is  
// unimportant) to --QDF=5 (freshness is very important) as follows:  
// --QDF=0: The request is for historic information from 5+ years ago, or for an unchanging, established fact (such as the radius of the Earth). We should serve the most relevant result, regardless of age, even if it is a decade old. No boost for fresher content.  
// --QDF=1: The request seeks information that's generally acceptable unless it's very outdated. Boosts results from the past 18 months.  
// --QDF=2: The request asks for something that in general does not change very quickly. Boosts results from the past 6 months.  
// --QDF=3: The request asks for something might change over time, so we should serve something from the past quarter / 3 months. Boosts results from the past 90 days.  
// --QDF=4: The request asks for something recent, or some information that could evolve quickly. Boosts results from the past 60 days.  
// --QDF=5: The request asks for the latest or most recent information, so we should serve something from this month. Boosts results from the past 30 days and sooner.  
// Here are some examples of how to use the msearch command:  
// User: What was the GDP of France and Italy in the 1970s? => {{"queries": ["GDP of +France in the 1970s --QDF=0", "GDP of +Italy in the 1970s --QDF=0"]}} # Historical query. Note that the QDF param is specified for each query independently, and entities are prefixed with a +  
// User: What does the report say about the GPT4 performance on MMLU? => {{"queries": ["+GPT4 performance on +MMLU benchmark --QDF=1"]}}  
// User: How can I integrate customer relationship management system with third-party email marketing tools? => {{"queries": ["Customer Management System integration with +email marketing --QDF=2"]}}  
// User: What are the best practices for data security and privacy for our cloud storage services? => {{"queries": ["Best practices for +security and +privacy for +cloud storage --QDF=2"]}}  
// User: What is the Design team working on? => {{"queries": ["current projects OKRs for +Design team --QDF=3"]}}  
// User: What is John Doe working on? => {{"queries": ["current projects tasks for +(John Doe) --QDF=3"]}}  
// User: Has Metamoose been launched? => {{"queries": ["Launch date for +Metamoose --QDF=4"]}}  
// User: Is the office closed this week? => {{"queries": ["+Office closed week of July 2024 --QDF=5"]}}  

// Please make sure to use the + operator as well as the QDF operator with your queries, to help retrieve more relevant results.  
// Notes:  
// * In some cases, metadata such as file_modified_at and file_created_at timestamps may be included with the document. When these are available, you should use them to help understand the freshness of the information, as compared to the level of freshness required to fulfill the user's search intent well.  
// * Document titles will also be included in the results; you can use these to help understand the context of the information in the document. Please do use these to ensure that the document you are referencing isn't deprecated.  
// * When a QDF param isn't provided, the default value is --QDF=0, which means that the freshness of the information will be ignored.  

// Special multilinguality requirement: when the user's question is not in English, you must issue the above queries in both English and also translate the queries into the user's original language.  

// Examples:  
// User: 김민준이 무엇을 하고 있나요? => {{"queries": ["current projects tasks for +(Kim Minjun) --QDF=3", "현재 프로젝트 및 작업 +(김민준) --QDF=3"]}}  
// User: オフィスは今週閉まっていますか？ => {{"queries": ["+Office closed week of July 2024 --QDF=5", "+オフィス 2024年7月 週 閉鎖 --QDF=5"]}}  
// User: ¿Cuál es el rendimiento del modelo 4o en GPQA? => {{"queries": ["GPQA results for +(4o model)", "4o model accuracy +(GPQA)", "resultados de GPQA para +(modelo 4o)", "precisión del modelo 4o +(GPQA)"]}}  

// **Important information:** Here are the internal retrieval indexes (knowledge stores) you have access to and are allowed to search:  
// **recording_knowledge**  
// Where:  
// - recording_knowledge: The knowledge store of all users' recordings, including transcripts and summaries. Only use this knowledge store when user asks about recordings, meetings, transcripts, or summaries. Avoid overusing source_filter for recording_knowledge unless the user explicitly requests — other sources often contain richer information for general queries.  

type msearch = (_: {  
queries?: string[],  
intent?: string,  
time_frame_filter?: {  
  start_date: string;  
  end_date: string;  
},  
}) => any;  

} // namespace file_search  
