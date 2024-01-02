import jieba
import json
from snownlp import SnowNLP
from flask import Flask, request, Response
from flask_cors import CORS

stop_word_path = "/home/lighthouse/bilibili-comments/stopwords.txt"
stopWordTxt = open(stop_word_path, "r").readlines()
stop_words = [line.strip() for line in stopWordTxt] 

def extractKeywords(str_txt, topNum=20):
  words = jieba.lcut(str_txt)
  counts = {}

  for word in words:
    if (word not in stop_words):
      if (len(word) == 1):
        continue
      else:
        counts[word] = counts.get(word, 0) + 1
  items = list(counts.items())
  items.sort(key = lambda x: x[1], reverse=True)

  return items[0:topNum]

def analyseEmotion(str_txt):
  s = SnowNLP(str_txt)
  sentiments = s.sentiments
  return sentiments
  

app = Flask(__name__)
CORS(app, origins="*", methods=["GET", "POST", "OPTIONS"], allow_headers="*", max_age=10000)

@app.route('/')
def hello_world():
  print("hello_world")
  return 'welcome!!'

# 评论参数 replies[]
# 功能一：解析数组，生成前10个关键字
# 功能二：解析数组，分析评论的情感
# 接口返回：{ keywords: [], emotion: [{ reply_id, score }] }
@app.route('/analyse', methods=["POST", "GET"])
def analyse():
  replies_str = ''
  replies = request.json['replies']
  topNum = request.json.get('top', 30)
  emotions = []

  for reply in replies:
    txt = reply['content']
    replies_str += txt
    emotions.append({
      'score': analyseEmotion(txt),
      'reply_id': reply['reply_id']
    })

  keywords = extractKeywords(replies_str, topNum)
  result = { 'keywords': keywords, 'emotions': emotions }
  print("analyse success")
  return Response(json.dumps(result), mimetype='application/json')

if __name__ == '__main__':
  app.run()
