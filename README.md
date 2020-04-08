# PeanutTracker 花生打卡器
## 中文版本
### 简介
PeanutTracker是一款微信小程序，用于给刷题的朋友们记录打卡

推荐使用微信开发者工具运行本代码，因为微信开发者工具自带模拟器，能模拟手机上运行的效果。

### 更新日志

#### 20040801：简化显示搜索结果的逻辑

##### 需求：

之前的逻辑是，用户输入题号点击“搜索”按钮之后，搜索结果出现（前面有黄色条作为标识，左滑可以删除），再点击一下搜索结果它就会移入待提交区（前面有绿色条作为标识），等全部题目都移入待提交区后，点击“提交”按钮提交入数据库。

但实际情况是，搜索结果大概率不会有问题，用户不需要多点击一下进行确认。最好是默认搜索结果是正确的（也就是说不需点击确认直接移动入待提交区），如果错误的话，用户再左滑删除。

##### 实现：

把搜索结果直接移入待提交区比较容易，array里面加元素就行（push,concat均可）。有难度的是如何实现一列数据里的左滑删除，这需要做到：

- 能够得到用户是在哪一项上左滑的
- 左滑点击“删除”后，用一个绑定函数删除array里的这一项
- 前端也要实时更新，删除的数据项应该马上消失

要想实现这些，首先需要了解小程序的“数据绑定”和“列表渲染”，要想让前端随着array的更新实时变动，array需要是array of objects，在列表渲染的时候要指定wx:key=[某个属性，比如id]。另外有了列表渲染，就可以用`{{item.id}}`作为组件的id，这样一来用户操作这个组件的时候，我们就可以通过`e.currentTarget.id`来拿到这个项的id。有了id，在array里删除带有这个id的项就很容易了，可以通过JavaScript里的filter来完成。


---

## Englisgh Version
PeanutTracker is a WeChat miniprogram, helping users to track their LeetCode progress (or other practices from other algorithm platforms).

I recommend using WeChat Developer Tools to run this program, which provides an emulator to emulate what the program will look like on a mobile screen.
