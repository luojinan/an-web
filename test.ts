
/**
 * 考研词汇处理工具
 * 数据来源： https://github.com/exam-data/NETEMVocabulary
 * 
 * 维护逻辑：
 * 当github上的原始数据增多，生成的 onlyword 和 myWords 也会增多
 * 当原始数据增多了一些不需要的word，则需要手动到 noneed.json 中加入
 * ✨ 因此 noneed.json 不可删除，而 onlyword 和 myWords 都可以删除，运行脚本就会重新生成出来
 * 
 * 临时：waitToRead 是 onlyword 减去 noneed 的未标记的单词，在读完并标记是否noneed后不再需要，当前不可删除
 * 
 * 文件关系图：
 * [远程JSON] (https://raw.gitmirror.com/exam-data/NETEMVocabulary/master/netem_full_list.json)
 *       ↓ 读取
 * 原始数据 (Item[])
 *       ↓ 转换
 * 标准格式数据 (NewItem[])
 *       ↓ 处理
 * ├── 生成纯单词列表 (onlyword.json)
 * └── 过滤不需要的单词 (myWords.json)
 * 
 * 依赖文件：
 * - noneed.json: 包含需要过滤的单词列表
 * 
 * 生成文件：
 * - onlyword.json: 仅包含单词的列表
 * - myWords.json: 过滤后的完整单词数据
 * 
 */

import { readFileSync, writeFileSync } from 'node:fs';

type Item = {
  "序号": number,
  "词频": number,
  "单词": string,
  "释义": string,
  "其他拼写": any
}

type NewItem = {
  index: number,
  count: number,
  word: string,
  chinese: string,
  note: any
}

// 获取原始数据
async function getOriginWordData(url: string): Promise<Item[]> {
  const response = await fetch(url);
  const data = await response.json();
  return data['5530考研词汇词频排序表'];
}

// 转换数据结构
function transformWordData(items: Item[]): NewItem[] {
  return items.map(item => ({
    index: item.序号,
    count: item.词频,
    word: item.单词,
    chinese: item.释义,
    note: item.其他拼写
  }));
}

// 提取纯单词列表
function getOnlyWords(items: NewItem[]): string[] {
  return items.map(item => item.word);
}

// 读取不需要的单词列表
function getNoNeedWords(filePath: string): string[] {
  const data = readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

// 过滤不需要的单词
function filterNoNeed(items: NewItem[], noNeedWords: string[]): NewItem[] {
  return items.filter(item => !noNeedWords.includes(item.word));
}

// 生成最终单词文件
function genMyWords(filePath: string, data: NewItem[]): void {
  const jsonString = JSON.stringify(data, null, 2);
  writeFileSync(filePath, jsonString);
}

// 主流程
async function main() {
  try {
    const originData = await getOriginWordData('https://raw.gitmirror.com/exam-data/NETEMVocabulary/master/netem_full_list.json');
    const transformedData = transformWordData(originData);

    // 生成纯单词列表
    const onlyWords = getOnlyWords(transformedData);
    genMyWords('onlyword.json', onlyWords);
    console.log('单词提取完成，已保存到onlyword.json');

    // 过滤不需要的单词
    const noNeedWords = getNoNeedWords('./noneed.json');
    const filteredData = filterNoNeed(transformedData, noNeedWords);
    genMyWords('myWords.json', filteredData);
    console.log('单词过滤完成，已保存到myWords.json');

  } catch (error) {
    console.error('处理过程中发生错误:', error);
  }
}

// 执行主流程
main();