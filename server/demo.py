import jieba
import jieba.analyse
from snownlp import SnowNLP
from flask import Flask, request, Response
import json

app = Flask(__name__)

@app.route('/')
def hello_world():
  r = request.args.get('info', "NONNN")
  if r == None:
    return 'NONE'
  return r

@app.route('/login', methods=["POST"])
def login():
  print(request.headers)
  # print(request.stream.read()) read之后，就不能用form了
  # 针对form urlencodeed形式
  # print(request.form)
  # print(request.form['username'])
  # print(request.form.get('username'))
  # print(request.form.get('password', default='111'))

  # 针对json
  print(type(request.json))
  print(request.json)
  print(request.json['username'])
  print(request.json['password'])

  # 返回JSON
  result = { 'username': request.json['username'], 'password': request.json.get('password') }
  return Response(json.dumps(result), mimetype='application/json')

# if __name__ == '__main__':
#   app.run()

data_path = "/Users/joey/Code/mine/browser-scripts/bilibili-comments/test-data.txt"
stop_word_path = "/Users/joey/Code/mine/browser-scripts/bilibili-comments/stopwords.txt"
data_txt = open(data_path, "r").read()
comment_lines = open(data_path, "r").readlines()

stopWordTxt = open(stop_word_path, "r").readlines()
stop_words = [line.strip() for line in stopWordTxt] 
words = jieba.lcut(data_txt)
counts = {}
positive = 0
negative = 0

for line in comment_lines:
  s = SnowNLP(line)
  sentiments = s.sentiments
  if (sentiments >= 0.5):
    positive += 1
  else:
    negative += 1

# print(positive, negative)
print("积极评论：{0:<4}条, 消极评论：{1:>4}条".format(positive, negative))

for word in words:
  if word not in stop_words:
    if len(word) == 1:
      continue
    else:
      counts[word] = counts.get(word, 0) + 1

items = list(counts.items())
items.sort(key = lambda x: x[1], reverse=True)

for i in range(10):
  word, count = items[i]
  print("{0:<5}{1:>5}".format(word, count))
  
cut_str = "不说文科生，作为一名“资深的汽车维修员”，一个理工科的毕业生，我感觉好像现在我也是服务业的啊。我领导好像也是做服务业的，服务好他的领导。他的领导好像也是服务业的。诶，奇啦怪啦，突然觉得怎么好像周围大家都是做服务业的啊。都给谁服务啊这是？奇了怪了。\n这么说来这个感觉好像有差不多10年了。嗯，算算日子。应该有十年了。[嗑瓜子]"
jieba.analyse.set_stop_words(stop_word_path)
print(jieba.analyse.extract_tags(sentence=data_txt, topK=10, withWeight=True))